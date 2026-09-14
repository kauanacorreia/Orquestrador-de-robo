class AddTriggeredByToExecutions < ActiveRecord::Migration[8.1]
  def up
    add_column :executions, :triggered_by, :string

    # Backfill: ate agora toda execution existente foi criada manualmente
    # (nenhuma tinha schedule_id); o Agendador (Fase 2) e que passa a
    # popular schedule_id de verdade.
    execute <<~SQL
      UPDATE executions
      SET triggered_by = CASE WHEN schedule_id IS NULL THEN 'manual' ELSE 'scheduled' END
      WHERE triggered_by IS NULL
    SQL

    change_column_null :executions, :triggered_by, false
    change_column_default :executions, :triggered_by, from: nil, to: "manual"

    add_check_constraint :executions,
      "triggered_by IN ('manual', 'scheduled')",
      name: "executions_triggered_by_check"
  end

  def down
    remove_check_constraint :executions, name: "executions_triggered_by_check"
    remove_column :executions, :triggered_by
  end
end
