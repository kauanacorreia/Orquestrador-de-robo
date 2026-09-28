# Executa (por enquanto, de forma simulada) um robo para uma Execution ja
# criada. Ainda nao existe um motor de execucao real integrado - este job e
# um stub que so demonstra o fluxo (RUNNING -> SUCCESS) e grava ExecutionLog.
#
# TODO: substituir o corpo de #perform pela chamada ao motor de execucao real
# (script/RPA/worker externo) quando ele existir, mantendo os mesmos updates
# de status/ExecutionLog/finished_at/locked_at.
class RobotExecutionJob < ApplicationJob
  queue_as :default

  def perform(execution_id)
    execution = Execution.find(execution_id)

    execution.update!(
      status: "RUNNING",
      started_at: execution.started_at || Time.current,
      locked_at: Time.current
    )

    log(execution, "INFO", "Execução iniciada (motor de execução ainda não implementado — stub).")
    log(execution, "INFO", "Execução concluída com sucesso (stub).")

    execution.update!(status: "SUCCESS", finished_at: Time.current, locked_at: nil)
    notify(execution, "execution_success", "Execução concluída", "#{execution.robot.name} (#{execution.company.name}) foi executado com sucesso.")
  rescue StandardError => e
    execution&.update(status: "FAILED", finished_at: Time.current, locked_at: nil, error_message: e.message)
    log(execution, "ERROR", "Falha na execução: #{e.message}") if execution
    notify(execution, "execution_failed", "Execução falhou", "#{execution.robot.name} (#{execution.company.name}) falhou: #{e.message}") if execution
    raise
  end

  private

  def log(execution, level, message)
    execution.execution_logs.create!(
      level: level,
      message: message
    )
  end

  def notify(execution, kind, title, message)
    Notification.create!(
      title: title,
      message: message,
      kind: kind,
      execution_id: execution.id,
      link_path: "/historico"
    )
  end
end
