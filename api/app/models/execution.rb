class Execution < ApplicationRecord
  # Colunas reais (ver db real via Supabase, nao o schema.rb desatualizado):
  # id, company_id, robot_id, schedule_id, status, started_at, finished_at,
  # locked_at, error_message, created_at.
  belongs_to :company
  belongs_to :robot
  belongs_to :schedule, optional: true

  has_many :execution_logs, dependent: :destroy

  validates :status,
            inclusion: { in: %w[PENDING RUNNING SUCCESS FAILED] }

  validates :triggered_by,
            inclusion: { in: %w[manual scheduled] }

  def duration_ms
    return nil unless started_at && finished_at

    ((finished_at - started_at) * 1000).round
  end
end
