class RobotVersion < ApplicationRecord
  self.table_name = "robot_versions"

  belongs_to :robot
end