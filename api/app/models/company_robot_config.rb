class CompanyRobotConfig < ApplicationRecord
  belongs_to :company
  belongs_to :robot

  validates :company_id, uniqueness: { scope: :robot_id }
end