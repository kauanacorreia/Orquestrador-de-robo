module Schedules
  # A tela de Agendador so expoe um componente amigavel de recorrencia
  # (Dias da Semana + Horario). Por baixo, isso vira uma expressao cron real
  # (coluna cron_expression, ja existente no banco) no formato:
  #   "<minuto> <hora> * * <dias-da-semana>"
  # onde <dias-da-semana> e "*" (todo dia) ou uma lista de dias/faixas, ex:
  # "1,3,5" ou "1-5" (0=domingo ... 6=sabado, igual ao Time#wday).
  #
  # #build so gera listas simples (o formulario usa checkboxes por dia), mas
  # #parse/#describe/#next_execution tambem entendem faixas ("1-5") porque
  # ja existem agendamentos no banco cadastrados assim.
  module Cron
    DAY_NAMES = %w[domingo segunda terça quarta quinta sexta sábado].freeze
    DAY_ABBR = %w[Dom Seg Ter Qua Qui Sex Sáb].freeze
    WEEKDAYS = [1, 2, 3, 4, 5].freeze

    DAY_TOKEN = /[0-6](-[0-6])?/
    FORMAT = /\A([0-5]?\d) ([01]?\d|2[0-3]) \* \* (\*|#{DAY_TOKEN}(,#{DAY_TOKEN})*)\z/

    ParseError = Class.new(StandardError)

    module_function

    def build(hour:, minute:, days_of_week:)
      days = Array(days_of_week).map(&:to_i).sort.uniq
      dow_field = days.empty? ? "*" : days.join(",")

      "#{minute.to_i} #{hour.to_i} * * #{dow_field}"
    end

    def valid?(cron_expression)
      cron_expression.to_s.match?(FORMAT)
    end

    def parse(cron_expression)
      match = cron_expression.to_s.match(FORMAT)
      raise ParseError, "expressão cron inválida: #{cron_expression.inspect}" unless match

      {
        minute: match[1].to_i,
        hour: match[2].to_i,
        days_of_week: match[3] == "*" ? nil : expand_days(match[3])
      }
    end

    def describe(cron_expression)
      parsed = parse(cron_expression)
      time = format("%02d:%02d", parsed[:hour], parsed[:minute])
      days = parsed[:days_of_week]

      if days.nil? || days.length == 7
        "Todos os dias às #{time}"
      elsif days.sort == WEEKDAYS
        "Dias úteis às #{time}"
      else
        "#{days.map { |d| DAY_ABBR[d] }.join(', ')} às #{time}"
      end
    end

    def next_execution(cron_expression, from: Time.current)
      parsed = parse(cron_expression)
      days = parsed[:days_of_week]

      (0..7).each do |offset|
        candidate_date = from.to_date + offset.days

        next if days && !days.include?(candidate_date.wday)

        candidate = Time.zone.local(
          candidate_date.year, candidate_date.month, candidate_date.day,
          parsed[:hour], parsed[:minute], 0
        )

        return candidate if candidate > from
      end

      nil
    end

    def expand_days(field)
      field.split(",").flat_map do |token|
        if token.include?("-")
          low, high = token.split("-").map(&:to_i)
          (low..high).to_a
        else
          [token.to_i]
        end
      end.sort.uniq
    end
  end
end
