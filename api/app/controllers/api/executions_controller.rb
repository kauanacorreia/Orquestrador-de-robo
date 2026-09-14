module Api
  class ExecutionsController < ApplicationController
    def index
      scoped = filtered_executions

      executions = scoped
        .order(started_at: :desc, created_at: :desc)
        .limit(page_size)
        .offset(page_size * (page - 1))

      render json: {
        data: executions.map { |execution| execution_json(execution) },
        total: scoped.count,
        page: page,
        page_size: page_size
      }
    end

    def show
      execution = Execution.find(params[:id])

      render json: execution_json(execution)
    end

    def logs
      execution = Execution.find(params[:id])

      render json: execution.execution_logs.order(:created_at).map { |entry|
        {
          id: entry.id,
          level: entry.level,
          message: entry.message,
          created_at: entry.created_at
        }
      }
    end

    private

    def filtered_executions
      executions = Execution.all

      executions = executions.where(company_id: params[:company_id]) if params[:company_id].present?
      executions = executions.where(robot_id: params[:robot_id]) if params[:robot_id].present?
      executions = executions.where(status: params[:status]) if params[:status].present?

      if params[:start_date].present? && params[:end_date].present?
        executions = executions.where(
          "COALESCE(started_at, created_at) BETWEEN ? AND ?",
          Date.iso8601(params[:start_date]).beginning_of_day,
          Date.iso8601(params[:end_date]).end_of_day
        )
      end

      executions
    end

    def page
      [params[:page].to_i, 1].max
    end

    def page_size
      requested = params[:page_size].to_i
      requested.positive? ? [requested, 100].min : 25
    end

    def execution_json(execution)
      {
        id: execution.id,
        company_id: execution.company_id,
        company_name: execution.company&.name,
        robot_id: execution.robot_id,
        robot_name: execution.robot&.name,
        schedule_id: execution.schedule_id,
        status: execution.status,
        triggered_by: execution.triggered_by,
        started_at: execution.started_at,
        finished_at: execution.finished_at,
        duration_ms: execution.duration_ms,
        error_message: execution.error_message,
        created_at: execution.created_at
      }
    end
  end
end
