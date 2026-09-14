class ExecutionLog < ApplicationRecord
  belongs_to :execution

  validates :level,
            inclusion: { in: %w[INFO WARNING ERROR DEBUG] }

  validates :message, presence: true
end
