class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications, id: :uuid do |t|
      t.text :title, null: false
      t.text :message, null: false
      t.text :kind, null: false
      t.uuid :execution_id
      t.text :link_path

      t.timestamps
    end

    add_index :notifications, :created_at, name: "idx_notifications_created_at"

    add_foreign_key :notifications, :executions, name: "notifications_execution_id_fkey", on_delete: :nullify

    add_check_constraint :notifications,
      "kind IN ('execution_success', 'execution_failed')",
      name: "notifications_kind_check"
  end
end
