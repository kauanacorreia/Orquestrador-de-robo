class CreateCompanyGroupMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :company_group_memberships, id: :uuid do |t|
      t.references :company_group,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.references :company,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.timestamps
    end

    add_index :company_group_memberships,
              [:company_group_id, :company_id],
              unique: true,
              name: 'idx_company_group_memberships_unique'
  end
end