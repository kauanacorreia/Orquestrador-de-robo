module Api
  class DashboardController < ApplicationController
    def summary
      executions = filtered_executions

      total = executions.count
      success_count = executions.where(status: "SUCCESS").count
      failure_count = executions.where(status: "FAILED").count

      last_24h = executions.where(
        "COALESCE(started_at, created_at) >= ?",
        24.hours.ago
      )

      failures_last_24h = last_24h.where(status: "FAILED").count

      render json: {
        total_executions: total,
        success_count: success_count,
        success_rate: percentage(success_count, total),

        failure_count: failure_count,
        failure_rate: percentage(failure_count, total),

        failures_last_24h: failures_last_24h,
        failures_last_24h_rate: percentage(
          failures_last_24h,
          last_24h.count
        ),

        active_robots: Robot.where(status: "ACTIVE").count,

        # Bug: o login e registrado em last_login_at (ver
        # Api::V1::UsersController#record_login); last_login nunca e
        # preenchido, entao esse KPI sempre dava 0.
        active_users: Profile.where(
          "last_login_at >= ?",
          24.hours.ago
        ).count,

        clients: Company.count,

        critical_robot: critical_robot_stats
      }
    end

    def volumetria
      executions = filtered_executions

      counts = executions
        .group(
          Arel.sql("DATE(COALESCE(started_at, created_at))"),
          :status
        )
        .count

      start_date = parsed_start_date
      end_date = parsed_end_date

      result = (start_date..end_date).map do |date|
        success = counts[[date, "SUCCESS"]] || 0
        failure = counts[[date, "FAILED"]] || 0
        running = counts[[date, "RUNNING"]] || 0
        pending = counts[[date, "PENDING"]] || 0

        {
          date: date.iso8601,
          executions: success + failure + running + pending,
          success: success,
          failure: failure
        }
      end

      render json: result
    end

    def filter_options
      render json: {
        robots: Robot.order(:name).map do |robot|
          {
            id: robot.id.to_s,
            name: robot.name
          }
        end,

        clients: Company.order(:name).map do |company|
          {
            id: company.id.to_s,
            name: company.name
          }
        end,

        # A tabela executions atualmente nao possui user_id/profile_id.
        # Portanto nao existe uma forma correta de filtrar execucoes
        # por usuario neste momento.
        users: []
      }
    end

    private

    def filtered_executions
      executions = Execution.where(
        "COALESCE(started_at, created_at) BETWEEN ? AND ?",
        parsed_start_date.beginning_of_day,
        parsed_end_date.end_of_day
      )

      robot_ids = Array(params[:robot_ids]).reject(&:blank?)

      if robot_ids.any?
        executions = executions.where(robot_id: robot_ids)
      end

      client_ids = Array(params[:client_ids]).reject(&:blank?)

      if client_ids.any?
        executions = executions.where(company_id: client_ids)
      end

      statuses = mapped_statuses

      if statuses.any?
        executions = executions.where(status: statuses)
      end

      executions
    end

    def mapped_statuses
      Array(params[:statuses])
        .flat_map do |status|
          case status.to_s.downcase
          when "success"
            ["SUCCESS"]
          when "failure", "failed"
            ["FAILED"]
          when "started", "running"
            ["RUNNING"]
          when "pending"
            ["PENDING"]
          else
            []
          end
        end
        .uniq
    end

    def parsed_start_date
      @parsed_start_date ||= if params[:start_date].present?
        Date.iso8601(params[:start_date])
      else
        7.days.ago.to_date
      end
    end

    def parsed_end_date
      @parsed_end_date ||= if params[:end_date].present?
        Date.iso8601(params[:end_date])
      else
        Date.current
      end
    end

    def percentage(value, total)
      return 0 if total.zero?

      ((value.to_f / total) * 100).round(2)
    end

    # KPI "Robô mais crítico": dentro do periodo/filtros atuais, o robo com
    # mais execucoes com falha (desempate pela maior taxa de erro). Retorna
    # nil se nenhum robo teve falha no periodo.
    def critical_robot_stats
      totals = Hash.new(0)
      failures = Hash.new(0)

      filtered_executions
        .group(:robot_id, :status)
        .count
        .each do |(robot_id, status), count|
          totals[robot_id] += count
          failures[robot_id] += count if status == "FAILED"
        end

      robot_id = failures
        .select { |_id, count| count.positive? }
        .keys
        .max_by { |id| [failures[id], failures[id].to_f / totals[id]] }

      return nil unless robot_id

      total = totals[robot_id]
      errors = failures[robot_id]

      {
        robot_id: robot_id,
        robot_name: Robot.find_by(id: robot_id)&.name,
        total_executions: total,
        errors: errors,
        error_rate: percentage(errors, total)
      }
    end
  end
end