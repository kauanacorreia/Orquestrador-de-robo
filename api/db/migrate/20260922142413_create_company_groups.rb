class CreateCompanyGroups < ActiveRecord::Migration[8.1]
  def change
    create_table :company_groups, id: :uuid do |t|
      t.string :name, null: false

      t.timestamps
    end

    add_index :company_groups, :name
  end
end