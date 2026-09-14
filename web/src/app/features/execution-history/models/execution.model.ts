export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED';

export type TriggeredBy = 'manual' | 'scheduled';

export interface Execution {
  id: string;
  company_id: string;
  company_name: string | null;
  robot_id: string;
  robot_name: string | null;
  schedule_id: string | null;
  status: ExecutionStatus;
  triggered_by: TriggeredBy;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface ExecutionLogEntry {
  id: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  created_at: string;
}

export interface ExecutionFilters {
  company_id?: string;
  robot_id?: string;
  status?: ExecutionStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface ExecutionListResponse {
  data: Execution[];
  total: number;
  page: number;
  page_size: number;
}
