export type PeriodPreset = 'today' | '7d' | '30d' | 'custom';

export type ActivityLogStatus = 'success' | 'started' | 'failure';

export interface DashboardFilters {
  periodPreset: PeriodPreset;
  startDate: string;
  endDate: string;
  robotIds: string[];
  clientIds: string[];
  userIds: string[];
  statuses: ActivityLogStatus[];
}

export interface DashboardSummary {
  totalExecutions: number;
  successCount: number;
  successRate: number;
  failureCount: number;
  failureRate: number;
  failuresLast24h: number;
  failuresLast24hRate: number;
  activeRobots: number;
  activeUsers: number;
  clients: number;
}

export interface VolumetriaPoint {
  date: string;
  executions: number;
  success: number;
  failure: number;
}

export interface RatePoint {
  date: string;
  rate: number;
}

export interface RobotOption {
  id: string;
  name: string;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  name: string;
}

export interface DashboardFilterOptions {
  robots: RobotOption[];
  clients: ClientOption[];
  users: UserOption[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  robotId: string;
  robotName: string;
  clientId: string;
  clientName: string;
  userId: string;
  userName: string;
  status: ActivityLogStatus;
  step: string;
}

export interface DashboardSummaryDto {
  total_executions: number;
  success_count: number;
  success_rate: number;
  failure_count: number;
  failure_rate: number;
  failures_last_24h: number;
  failures_last_24h_rate: number;
  active_robots: number;
  active_users: number;
  clients: number;
}

export interface VolumetriaPointDto {
  date: string;
  executions: number;
  success: number;
  failure: number;
}

export interface RobotOptionDto {
  id: string;
  name: string;
}

export interface ClientOptionDto {
  id: string;
  name: string;
}

export interface UserOptionDto {
  id: string;
  name: string;
}

export interface DashboardFilterOptionsDto {
  robots: RobotOptionDto[];
  clients: ClientOptionDto[];
  users: UserOptionDto[];
}

export interface ActivityLogDto {
  id: string;
  timestamp: string;
  robot_id: string;
  robot_name: string;
  client_id: string;
  client_name: string;
  user_id: string;
  user_name: string;
  status: ActivityLogStatus;
  step: string;
}
