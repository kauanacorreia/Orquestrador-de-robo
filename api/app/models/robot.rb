class Robot < ApplicationRecord
  self.table_name = "robots"

  has_many :robot_versions, foreign_key: :robot_id, dependent: :destroy
end