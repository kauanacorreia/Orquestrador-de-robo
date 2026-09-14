class Schedule < ApplicationRecord
  # Colunas reais: id, company_id, robot_id, cron_expression, next_execution,
  # status, created_at, updated_at. Nao existem frequency/name/days_of_week -
  # tudo isso vive dentro de cron_expression (ver Schedules::Cron).
  STATUSES = %w[ACTIVE PAUSED].freeze

  belongs_to :company
  belongs_to :robot

  has_many :executions, dependent: :nullify

  validates :status, inclusion: { in: STATUSES }
  validate :cron_expression_valid

  before_save :assign_next_execution

  def cron_description
    Schedules::Cron.describe(cron_expression)
  rescue Schedules::Cron::ParseError
    cron_expression
  end

  private

  def cron_expression_valid
    return if cron_expression.blank?

    errors.add(:cron_expression, "inválida") unless Schedules::Cron.valid?(cron_expression)
  end

  def assign_next_execution
    return if status == "PAUSED" || cron_expression.blank?

    self.next_execution = Schedules::Cron.next_execution(cron_expression)
  end
end
