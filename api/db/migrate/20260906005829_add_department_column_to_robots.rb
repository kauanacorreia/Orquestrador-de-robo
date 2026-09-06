class AddDepartmentColumnToRobots < ActiveRecord::Migration[8.1]
  def change
    return if column_exists?(:robots, :department)

    add_column :robots, :department, :text
  end
end