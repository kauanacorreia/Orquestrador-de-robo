# Roda periodicamente (ver config/recurring.yml) e dispara a execucao de
# todos os agendamentos ativos cujo next_execution ja chegou. "Executar
# Agora" (Api::SchedulesController#run_now) faz o mesmo, mas sob demanda.
class DispatchDueSchedulesJob < ApplicationJob
  queue_as :default

  def perform
    Schedule
      .where(status: "ACTIVE")
      .where("next_execution IS NOT NULL AND next_execution <= ?", Time.current)
      .find_each { |schedule| dispatch(schedule) }
  end

  private

  def dispatch(schedule)
    execution = Execution.create!(
      company_id: schedule.company_id,
      robot_id: schedule.robot_id,
      schedule_id: schedule.id,
      status: "PENDING",
      triggered_by: "scheduled",
      started_at: Time.current
    )

    RobotExecutionJob.perform_later(execution.id)

    # Recalcula o proximo horario (a validacao/before_save do model cuida disso).
    schedule.save!
  end
end
