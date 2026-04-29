import { MonthlyRule } from '../types/monthly-rule.type';

// ── Fixed Malta national collection schedule ──────────────────────────────────

const MALTA_SCHEDULE: Record<
  string,
  | { type: 'weekly'; weekdays: string[] }
  | { type: 'monthly'; monthlyRules: MonthlyRule[] }
> = {
  organic: { type: 'weekly', weekdays: ['monday', 'wednesday', 'friday'] },
  mixed: { type: 'weekly', weekdays: ['tuesday', 'saturday'] },
  recyclable: { type: 'weekly', weekdays: ['thursday'] },
  glass: {
    type: 'monthly',
    monthlyRules: [
      { week: 'first', weekday: 'friday' },
      { week: 'third', weekday: 'friday' },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export interface DashboardDay {
  date: string;
  trashTypes: string[];
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function computeWeeklyHits(
  weekdays: string[],
  fromDate: Date,
  days: number,
): string[] {
  const hits: string[] = [];
  const end = addDays(fromDate, days);

  for (const weekday of weekdays) {
    const targetIndex = WEEKDAY_INDEX[weekday];
    if (targetIndex === undefined) continue;

    const offset = (targetIndex - fromDate.getDay() + 7) % 7;
    let current = addDays(fromDate, offset);

    while (current < end) {
      hits.push(toDateString(current));
      current = addDays(current, 7);
    }
  }

  return hits;
}

function computeMonthlyHits(
  rules: MonthlyRule[],
  fromDate: Date,
  days: number,
): string[] {
  const hits: string[] = [];
  const end = addDays(fromDate, days);

  const startYear = fromDate.getFullYear();
  const startMonth = fromDate.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  for (const rule of rules) {
    const targetWeekdayIndex = WEEKDAY_INDEX[rule.weekday];
    if (targetWeekdayIndex === undefined) continue;

    let year = startYear;
    let month = startMonth;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      let candidate: Date;

      if (rule.week === 'last') {
        const lastDay = new Date(year, month + 1, 0);
        const diff = (lastDay.getDay() - targetWeekdayIndex + 7) % 7;
        candidate = addDays(lastDay, -diff);
      } else {
        const occurrenceMap: Record<string, number> = {
          first: 1,
          second: 2,
          third: 3,
          fourth: 4,
        };
        const occurrence = occurrenceMap[rule.week];
        const firstDay = new Date(year, month, 1);
        const offset = (targetWeekdayIndex - firstDay.getDay() + 7) % 7;
        candidate = addDays(firstDay, offset + (occurrence - 1) * 7);
        if (candidate.getMonth() !== month) {
          month++;
          if (month > 11) { month = 0; year++; }
          continue;
        }
      }

      if (candidate >= fromDate && candidate < end) {
        hits.push(toDateString(candidate));
      }

      month++;
      if (month > 11) { month = 0; year++; }
    }
  }

  return hits;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getUpcomingDays(
  trashTypes: string[],
  fromDate: Date,
  days: number,
): DashboardDay[] {
  const map = new Map<string, Set<string>>();

  for (const trashType of trashTypes) {
    const rule = MALTA_SCHEDULE[trashType];
    if (!rule) continue;

    let hits: string[];
    if (rule.type === 'weekly') {
      hits = computeWeeklyHits(rule.weekdays, fromDate, days);
    } else {
      hits = computeMonthlyHits(rule.monthlyRules, fromDate, days);
    }

    for (const dateStr of hits) {
      if (!map.has(dateStr)) map.set(dateStr, new Set());
      map.get(dateStr)!.add(trashType);
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, types]) => ({ date, trashTypes: [...types] }));
}
