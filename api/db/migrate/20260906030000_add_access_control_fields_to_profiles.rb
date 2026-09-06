class AddAccessControlFieldsToProfiles < ActiveRecord::Migration[8.1]
  def up
    add_column :profiles, :email, :text
    add_column :profiles, :last_login_at, :datetime

    execute <<~SQL
      UPDATE profiles AS profiles
      SET email = users.email
      FROM auth.users AS users
      WHERE profiles.id = users.id
        AND profiles.email IS NULL;
    SQL

    execute <<~SQL
      UPDATE profiles
      SET role = 'OPERATOR'
      WHERE role IN ('MANAGER', 'VIEWER');
    SQL

    change_column_default :profiles, :role, "OPERATOR"

    remove_check_constraint(
      :profiles,
      name: "profiles_role_check"
    )

    add_check_constraint(
      :profiles,
      "role IN ('ADMIN', 'OPERATOR')",
      name: "profiles_role_check"
    )

    add_index :profiles, :email, unique: true
  end

  def down
    remove_index :profiles, :email

    remove_check_constraint(
      :profiles,
      name: "profiles_role_check"
    )

    execute <<~SQL
      UPDATE profiles
      SET role = 'VIEWER'
      WHERE role = 'OPERATOR';
    SQL

    change_column_default :profiles, :role, "VIEWER"

    add_check_constraint(
      :profiles,
      "role IN ('ADMIN', 'MANAGER', 'VIEWER')",
      name: "profiles_role_check"
    )

    remove_column :profiles, :last_login_at
    remove_column :profiles, :email
  end
end