class CompanyGroup < ApplicationRecord
  has_many :company_group_memberships,
           dependent: :destroy

  has_many :companies,
           through: :company_group_memberships

  validates :name,
            presence: true
end