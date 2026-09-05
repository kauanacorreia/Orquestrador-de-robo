class CreateRobots < ActiveRecord::Migration[8.1]
  def change
    create_table :robots do |t|
      t.string :name, null: false
      t.text :description
      t.json :schema
      t.string :status, null: false, default: "ACTIVE"
      t.integer :current_version, null: false, default: 1

      t.timestamps
    end

    add_index :robots, :status
  end
end
