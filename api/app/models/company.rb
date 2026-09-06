class Company < ApplicationRecord
  has_many :company_robot_configs, dependent: :destroy

  validates :code,
            presence: true,
            uniqueness: { case_sensitive: false }

  validates :name, presence: true

  validates :cnpj,
            presence: true,
            uniqueness: true

  validates :status,
            inclusion: { in: %w[ACTIVE INACTIVE] }

  encrypts :access_password
  encrypts :secret_phrase
end