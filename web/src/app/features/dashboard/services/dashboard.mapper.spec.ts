import {
  ActivityLogDto,
  DashboardFilterOptionsDto,
  DashboardSummaryDto,
  VolumetriaPointDto,
} from '../models/dashboard.model';
import { generateMockLog, toActivityLog, toDashboardFilterOptions, toDashboardSummary, toVolumetriaPoint } from './dashboard.mapper';

describe('dashboard.mapper', () => {
  it('toDashboardSummary converts snake_case dto to camelCase model', () => {
    // O backend (Api::DashboardController#summary) retorna as taxas ja em
    // percentual (0-100), nao como fracao (0-1) - o mapper precisa dividir
    // por 100 para o template poder fazer `rate * 100` sem duplicar.
    const dto: DashboardSummaryDto = {
      total_executions: 1250,
      success_count: 1180,
      success_rate: 94.4,
      failure_count: 70,
      failure_rate: 5.6,
      failures_last_24h: 12,
      failures_last_24h_rate: 8,
      active_robots: 3,
      active_users: 12,
      clients: 34,
      critical_robot: {
        robot_id: 'robot-1',
        robot_name: 'Robô Faturamento',
        total_executions: 40,
        errors: 10,
        error_rate: 25,
      },
    };

    const result = toDashboardSummary(dto);

    expect(result.totalExecutions).toBe(1250);
    expect(result.successCount).toBe(1180);
    expect(result.successRate).toBeCloseTo(0.944, 5);
    expect(result.failureCount).toBe(70);
    expect(result.failureRate).toBeCloseTo(0.056, 5);
    expect(result.failuresLast24h).toBe(12);
    expect(result.failuresLast24hRate).toBeCloseTo(0.08, 5);
    expect(result.activeRobots).toBe(3);
    expect(result.activeUsers).toBe(12);
    expect(result.clients).toBe(34);

    expect(result.criticalRobot?.robotId).toBe('robot-1');
    expect(result.criticalRobot?.robotName).toBe('Robô Faturamento');
    expect(result.criticalRobot?.totalExecutions).toBe(40);
    expect(result.criticalRobot?.errors).toBe(10);
    expect(result.criticalRobot?.errorRate).toBeCloseTo(0.25, 5);
  });

  it('toDashboardSummary handles a null critical_robot', () => {
    const dto: DashboardSummaryDto = {
      total_executions: 0,
      success_count: 0,
      success_rate: 0,
      failure_count: 0,
      failure_rate: 0,
      failures_last_24h: 0,
      failures_last_24h_rate: 0,
      active_robots: 0,
      active_users: 0,
      clients: 0,
      critical_robot: null,
    };

    expect(toDashboardSummary(dto).criticalRobot).toBeNull();
  });

  it('toVolumetriaPoint converts dto to model', () => {
    const dto: VolumetriaPointDto = { date: '2026-08-17', executions: 10, success: 8, failure: 2 };

    expect(toVolumetriaPoint(dto)).toEqual({ date: '2026-08-17', executions: 10, success: 8, failure: 2 });
  });

  it('toDashboardFilterOptions converts dto to model', () => {
    const dto: DashboardFilterOptionsDto = {
      robots: [{ id: 'robot-1', name: 'Robô Faturamento' }],
      clients: [{ id: 'client-1', name: 'Simpliss' }],
      users: [{ id: 'user-1', name: 'Ana Ribeiro' }],
    };

    expect(toDashboardFilterOptions(dto)).toEqual({
      robots: [{ id: 'robot-1', name: 'Robô Faturamento' }],
      clients: [{ id: 'client-1', name: 'Simpliss' }],
      users: [{ id: 'user-1', name: 'Ana Ribeiro' }],
    });
  });

  it('toActivityLog converts snake_case dto to camelCase model', () => {
    const dto: ActivityLogDto = {
      id: '1',
      timestamp: '2026-08-17T10:00:00.000Z',
      robot_id: 'robot-1',
      robot_name: 'Robô Faturamento',
      client_id: 'client-1',
      client_name: 'Simpliss',
      user_id: 'user-1',
      user_name: 'Ana Ribeiro',
      status: 'success',
      step: 'Conferência',
    };

    expect(toActivityLog(dto)).toEqual({
      id: '1',
      timestamp: '2026-08-17T10:00:00.000Z',
      robotId: 'robot-1',
      robotName: 'Robô Faturamento',
      clientId: 'client-1',
      clientName: 'Simpliss',
      userId: 'user-1',
      userName: 'Ana Ribeiro',
      status: 'success',
      step: 'Conferência',
    });
  });

  it('generateMockLog produces a valid ActivityLog', () => {
    const log = generateMockLog();

    expect(log.id).toBeTruthy();
    expect(log.timestamp).toBeTruthy();
    expect(log.robotName).toBeTruthy();
    expect(log.clientName).toBeTruthy();
    expect(log.userName).toBeTruthy();
    expect(['success', 'started', 'failure']).toContain(log.status);
    expect(log.step).toBeTruthy();
  });
});
