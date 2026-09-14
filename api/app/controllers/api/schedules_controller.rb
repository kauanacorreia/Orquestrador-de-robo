module Api
  class SchedulesController < ApplicationController
    def index
      schedules = Schedule.includes(:company, :robot).order(created_at: :desc)

      render json: schedules.map { |schedule| schedule_json(schedule) }
    end

    def create
      schedule = Schedule.new(schedule_attributes)
      schedule.status = "ACTIVE"

      if schedule.save
        render json: schedule_json(schedule), status: :created
      else
        render json: { errors: schedule.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      schedule = Schedule.find(params[:id])

      if schedule.update(schedule_attributes)
        render json: schedule_json(schedule)
      else
        render json: { errors: schedule.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # Altera o estado do agendamento sem precisar deletar.
    def toggle_status
      schedule = Schedule.find(params[:id])

      new_status = schedule.status == "ACTIVE" ? "PAUSED" : "ACTIVE"
      schedule.update!(status: new_status)

      render json: schedule_json(schedule)
    end

    # Bypassa o relogio: cria a Execution e enfileira o job imediatamente,
    # independente do next_execution do agendamento.
    def run_now
      schedule = Schedule.find(params[:id])

      execution = Execution.create!(
        company_id: schedule.company_id,
        robot_id: schedule.robot_id,
        schedule_id: schedule.id,
        status: "PENDING",
        triggered_by: "manual",
        started_at: Time.current
      )

      RobotExecutionJob.perform_later(execution.id)

      render json: { execution_id: execution.id, status: execution.status }, status: :accepted
    end

    private

    # Aceita tanto uma expressao cron pronta (uso avancado) quanto o par
    # amigavel days_of_week[] + time ("HH:MM") vindo do formulario da tela,
    # que é convertido para cron_expression aqui.
    def schedule_attributes
      permitted = params.permit(:company_id, :robot_id, :cron_expression, :time, days_of_week: [])

      if permitted[:cron_expression].blank? && permitted[:time].present?
        hour, minute = permitted[:time].split(":").map(&:to_i)

        permitted[:cron_expression] = Schedules::Cron.build(
          hour: hour,
          minute: minute,
          days_of_week: permitted[:days_of_week]
        )
      end

      permitted.except(:time, :days_of_week)
    end

    def schedule_json(schedule)
      parsed = begin
        Schedules::Cron.parse(schedule.cron_expression)
      rescue Schedules::Cron::ParseError
        nil
      end

      {
        id: schedule.id,
        company_id: schedule.company_id,
        company_name: schedule.company&.name,
        robot_id: schedule.robot_id,
        robot_name: schedule.robot&.name,
        cron_expression: schedule.cron_expression,
        cron_description: schedule.cron_description,
        # Forma estruturada (derivada do cron_expression) para preencher o
        # formulário amigável ao editar, sem duplicar o parser no frontend.
        time: parsed && format("%02d:%02d", parsed[:hour], parsed[:minute]),
        days_of_week: parsed&.fetch(:days_of_week),
        next_execution: schedule.next_execution,
        status: schedule.status
      }
    end
  end
end
