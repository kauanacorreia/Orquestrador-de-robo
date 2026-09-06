class CreateProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :profiles, id: false do |t|
      t.string :id, primary_key: true, null: false
      t.string :name
      t.string :role
      t.datetime :last_login

      t.timestamps
    end
  end
end
