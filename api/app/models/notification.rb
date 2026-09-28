class Notification < ApplicationRecord
  KINDS = %w[execution_success execution_failed].freeze

  belongs_to :execution, optional: true

  validates :title, presence: true
  validates :message, presence: true
  validates :kind, inclusion: { in: KINDS }
end
