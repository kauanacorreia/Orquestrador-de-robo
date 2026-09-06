class Profile < ApplicationRecord
  self.table_name = "profiles"

  ACCESS_LEVELS = %w[ADMIN OPERATOR].freeze

  validates :name,
            presence: true

  validates :email,
            uniqueness: {
              case_sensitive: false
            },
            allow_blank: true

  validates :role,
            inclusion: {
              in: ACCESS_LEVELS
            }

  def admin?
    role == "ADMIN"
  end

  def operator?
    role == "OPERATOR"
  end
end