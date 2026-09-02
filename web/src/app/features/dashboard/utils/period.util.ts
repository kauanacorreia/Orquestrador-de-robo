import { DashboardFilters, PeriodPreset } from '../models/dashboard.model';

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function resolvePeriodRange(
  preset: PeriodPreset,
  referenceDate: Date,
  customStart?: string,
  customEnd?: string,
): { startDate: string; endDate: string } {
  const today = startOfUtcDay(referenceDate);
  const endDate = toIsoDate(today);

  switch (preset) {
    case 'today':
      return { startDate: endDate, endDate };
    case '7d': {
      const start = new Date(today);
      start.setUTCDate(start.getUTCDate() - 6);
      return { startDate: toIsoDate(start), endDate };
    }
    case '30d': {
      const start = new Date(today);
      start.setUTCDate(start.getUTCDate() - 29);
      return { startDate: toIsoDate(start), endDate };
    }
    case 'custom':
      return { startDate: customStart ?? endDate, endDate: customEnd ?? endDate };
  }
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function formatPeriodLabel(filters: DashboardFilters): string {
  if (filters.periodPreset === 'today') {
    return 'Hoje';
  }

  if (filters.periodPreset === '7d') {
    return 'Últimos 7 dias';
  }

  if (filters.periodPreset === '30d') {
    return 'Últimos 30 dias';
  }

  return `${formatDate(filters.startDate)} – ${formatDate(filters.endDate)}`;
}

export function defaultDashboardFilters(referenceDate: Date): DashboardFilters {
  const { startDate, endDate } = resolvePeriodRange('7d', referenceDate);

  return {
    periodPreset: '7d',
    startDate,
    endDate,
    robotIds: [],
    clientIds: [],
    userIds: [],
    statuses: [],
  };
}
