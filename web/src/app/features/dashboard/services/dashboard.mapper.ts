import {
  ActivityLog,
  ActivityLogDto,
  ActivityLogStatus,
  ClientOption,
  DashboardFilterOptions,
  DashboardFilterOptionsDto,
  DashboardSummary,
  DashboardSummaryDto,
  RobotOption,
  UserOption,
  VolumetriaPoint,
  VolumetriaPointDto,
} from '../models/dashboard.model';

export function toDashboardSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    totalExecutions: dto.total_executions,
    successCount: dto.success_count,
    // O backend ja retorna a taxa em percentual (0-100, ex: 42.5). Guardamos
    // aqui como fracao (0-1) para o template poder fazer `rate * 100`
    // igual faz com as series do volumetria, sem duplicar a multiplicacao.
    successRate: dto.success_rate / 100,
    failureCount: dto.failure_count,
    failureRate: dto.failure_rate / 100,
    failuresLast24h: dto.failures_last_24h,
    failuresLast24hRate: dto.failures_last_24h_rate / 100,
    activeRobots: dto.active_robots,
    activeUsers: dto.active_users,
    clients: dto.clients,
    criticalRobot: dto.critical_robot
      ? {
          robotId: dto.critical_robot.robot_id,
          robotName: dto.critical_robot.robot_name,
          totalExecutions: dto.critical_robot.total_executions,
          errors: dto.critical_robot.errors,
          errorRate: dto.critical_robot.error_rate / 100,
        }
      : null,
  };
}

export function toVolumetriaPoint(dto: VolumetriaPointDto): VolumetriaPoint {
  return {
    date: dto.date,
    executions: dto.executions,
    success: dto.success,
    failure: dto.failure,
  };
}

export function toDashboardFilterOptions(dto: DashboardFilterOptionsDto): DashboardFilterOptions {
  return {
    robots: dto.robots.map((robot): RobotOption => ({ id: robot.id, name: robot.name })),
    clients: dto.clients.map((client): ClientOption => ({ id: client.id, name: client.name })),
    users: dto.users.map((user): UserOption => ({ id: user.id, name: user.name })),
  };
}

export function toActivityLog(dto: ActivityLogDto): ActivityLog {
  return {
    id: dto.id,
    timestamp: dto.timestamp,
    robotId: dto.robot_id,
    robotName: dto.robot_name,
    clientId: dto.client_id,
    clientName: dto.client_name,
    userId: dto.user_id,
    userName: dto.user_name,
    status: dto.status,
    step: dto.step,
  };
}

const MOCK_ROBOTS: RobotOption[] = [
  { id: 'robot-faturamento', name: 'Robô Faturamento' },
  { id: 'robot-conciliacao', name: 'Robô Conciliação Bancária' },
  { id: 'robot-cadastro', name: 'Robô Cadastro de Clientes' },
  { id: 'robot-nfe', name: 'Robô Emissão de NF-e' },
  { id: 'robot-importacao', name: 'Robô Importação de Planilhas' },
];

const MOCK_CLIENTS: ClientOption[] = [
  { id: 'client-simpliss', name: 'Simpliss' },
  { id: 'client-sat', name: 'SAT' },
  { id: 'client-balancete', name: 'Balancete' },
];

const MOCK_USERS: UserOption[] = [
  { id: 'user-ana', name: 'Ana Ribeiro' },
  { id: 'user-bruno', name: 'Bruno Alves' },
  { id: 'user-carla', name: 'Carla Souza' },
];

const MOCK_STEPS = ['Importação', 'Conferência', 'Geração', 'Validação', 'Envio'];

function randomFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// TODO: substituir por push em tempo real via WebSocket/ActionCable quando o backend suportar — este polling é só um mock temporário.
export function generateMockLog(): ActivityLog {
  const status = randomFrom<ActivityLogStatus>(['success', 'started', 'failure']);
  const robot = randomFrom(MOCK_ROBOTS);
  const client = randomFrom(MOCK_CLIENTS);
  const user = randomFrom(MOCK_USERS);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    robotId: robot.id,
    robotName: robot.name,
    clientId: client.id,
    clientName: client.name,
    userId: user.id,
    userName: user.name,
    status,
    step: randomFrom(MOCK_STEPS),
  };
}
