class AddStatusToProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :profiles,
               :status,
               :text,
               default: "ACTIVE",
               null: false

    add_check_constraint(
      :profiles,
      "status IN ('ACTIVE', 'INACTIVE')",
      name: "profiles_status_check"
    )

    add_index :profiles, :status
  end
end