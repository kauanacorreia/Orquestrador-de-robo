import {
  ActivityLogDto,
  DashboardFilterOptionsDto,
  DashboardSummaryDto,
  VolumetriaPointDto,
} from '../models/dashboard.model';
import { generateMockLog, toActivityLog, toDashboardFilterOptions, toDashboardSummary, toVolumetriaPoint } from './dashboard.mapper';

describe('dashboard.mapper', () => {
  it('toDashboardSummary converts snake_case dto to camelCase model', () => {
    const dto: DashboardSummaryDto = {
      total_executions: 1250,
      success_count: 1180,
      success_rate: 0.944,
      failure_count: 70,
      failure_rate: 0.056,
      failures_last_24h: 12,
      failures_last_24h_rate: 0.08,
      active_robots: 3,
      active_users: 12,
      clients: 34,
    };

    expect(toDashboardSummary(dto)).toEqual({
      totalExecutions: 1250,
      successCount: 1180,
      successRate: 0.944,
      failureCount: 70,
      failureRate: 0.056,
      failuresLast24h: 12,
      failuresLast24hRate: 0.08,
      activeRobots: 3,
      activeUsers: 12,
      clients: 34,
    });
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
