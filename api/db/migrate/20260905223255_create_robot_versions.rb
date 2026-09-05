class CreateRobotVersions < ActiveRecord::Migration[8.1]
  def change
    create_table :robot_versions do |t|
      t.references :robot, null: false, foreign_key: true
      t.integer :version, null: false
      t.json :schema

      t.timestamps
    end

    add_index :robot_versions, [:robot_id, :version], unique: true
  end
end
