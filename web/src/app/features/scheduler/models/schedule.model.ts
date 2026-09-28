export type ScheduleStatus = 'ACTIVE' | 'PAUSED';

export interface Schedule {
  id: string;
  company_id: string;
  company_name: string | null;
  robot_id: string;
  robot_name: string | null;
  cron_expression: string;
  cron_description: string;
  // Forma estruturada derivada do cron_expression, usada para preencher o
  // formulário amigável na edição. days_of_week nulo = todos os dias.
  time: string | null;
  days_of_week: number[] | null;
  starts_on: string | null;
  next_execution: string | null;
  status: ScheduleStatus;
}

// Payload amigavel: a tela so pede Dias da Semana + Horario, o backend
// converte isso para cron_expression (ver Schedules::Cron no Rails).
export interface SchedulePayload {
  company_id: string;
  robot_id: string;
  time: string; // "HH:mm"
  days_of_week: number[]; // 0=domingo ... 6=sabado; vazio = todos os dias
  starts_on: string; // "YYYY-MM-DD"
  status?: ScheduleStatus; // enviado só ao editar
}

export interface RunNowResponse {
  execution_id: string;
  status: string;
}
