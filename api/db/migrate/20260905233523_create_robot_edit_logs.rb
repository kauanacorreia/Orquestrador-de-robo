class CreateRobotEditLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :robot_edit_logs, id: :uuid do |t|
      t.uuid :robot_id, null: false
      t.uuid :user_id
      t.string :field_name, null: false
      t.text :old_value
      t.text :new_value
      t.timestamps
    end

    add_index :robot_edit_logs, :robot_id
    add_foreign_key :robot_edit_logs, :robots, column: :robot_id
  end
end