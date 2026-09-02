import { DashboardFilters } from '../models/dashboard.model';
import { defaultDashboardFilters, formatPeriodLabel, resolvePeriodRange } from './period.util';

describe('period.util', () => {
  const referenceDate = new Date('2026-08-24T15:30:00.000Z');

  describe('resolvePeriodRange', () => {
    it('resolves "today" to the same start and end date', () => {
      expect(resolvePeriodRange('today', referenceDate)).toEqual({
        startDate: '2026-08-24',
        endDate: '2026-08-24',
      });
    });

    it('resolves "7d" to a 7-day range ending today', () => {
      expect(resolvePeriodRange('7d', referenceDate)).toEqual({
        startDate: '2026-08-18',
        endDate: '2026-08-24',
      });
    });

    it('resolves "30d" to a 30-day range ending today', () => {
      expect(resolvePeriodRange('30d', referenceDate)).toEqual({
        startDate: '2026-07-26',
        endDate: '2026-08-24',
      });
    });

    it('resolves "custom" using the provided start and end dates', () => {
      expect(resolvePeriodRange('custom', referenceDate, '2026-08-01', '2026-08-10')).toEqual({
        startDate: '2026-08-01',
        endDate: '2026-08-10',
      });
    });
  });

  describe('formatPeriodLabel', () => {
    function buildFilters(overrides: Partial<DashboardFilters>): DashboardFilters {
      return {
        periodPreset: '7d',
        startDate: '2026-08-18',
        endDate: '2026-08-24',
        robotIds: [],
        clientIds: [],
        userIds: [],
        statuses: [],
        ...overrides,
      };
    }

    it('returns "Hoje" for the today preset', () => {
      expect(formatPeriodLabel(buildFilters({ periodPreset: 'today' }))).toBe('Hoje');
    });

    it('returns "Últimos 7 dias" for the 7d preset', () => {
      expect(formatPeriodLabel(buildFilters({ periodPreset: '7d' }))).toBe('Últimos 7 dias');
    });

    it('returns "Últimos 30 dias" for the 30d preset', () => {
      expect(formatPeriodLabel(buildFilters({ periodPreset: '30d' }))).toBe('Últimos 30 dias');
    });

    it('formats the explicit date range for the custom preset', () => {
      expect(
        formatPeriodLabel(buildFilters({ periodPreset: 'custom', startDate: '2026-08-01', endDate: '2026-08-10' })),
      ).toBe('01/08/2026 – 10/08/2026');
    });
  });

  describe('defaultDashboardFilters', () => {
    it('returns a 7-day preset with no dimension filters selected', () => {
      const filters = defaultDashboardFilters(referenceDate);

      expect(filters.periodPreset).toBe('7d');
      expect(filters.startDate).toBe('2026-08-18');
      expect(filters.endDate).toBe('2026-08-24');
      expect(filters.robotIds).toEqual([]);
      expect(filters.clientIds).toEqual([]);
      expect(filters.userIds).toEqual([]);
      expect(filters.statuses).toEqual([]);
    });
  });
});
