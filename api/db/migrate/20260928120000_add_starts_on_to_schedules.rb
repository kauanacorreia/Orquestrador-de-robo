class AddStartsOnToSchedules < ActiveRecord::Migration[8.1]
  def change
    add_column :schedules, :starts_on, :date
  end
end
