class CompanyGroupMembership < ApplicationRecord
  belongs_to :company_group
  belongs_to :company

  validates :company_id,
            uniqueness: {
              scope: :company_group_id
            }
end