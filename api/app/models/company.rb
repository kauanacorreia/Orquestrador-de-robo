class Company < ApplicationRecord
  has_many :company_robot_configs,
           dependent: :destroy

  has_many :company_group_memberships,
           dependent: :destroy

  has_many :company_groups,
           through: :company_group_memberships

  validates :code,
            presence: true,
            uniqueness: { case_sensitive: false }

  validates :name,
            presence: true

  validates :cnpj,
            presence: true,
            uniqueness: true

  validates :status,
            inclusion: { in: %w[ACTIVE INACTIVE] }

  encrypts :access_password
  encrypts :secret_phrase
end