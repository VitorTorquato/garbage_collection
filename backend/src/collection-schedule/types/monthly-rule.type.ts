export type WeekOccurrence = 'first' | 'second' | 'third' | 'fourth' | 'last';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface MonthlyRule {
  week: WeekOccurrence;
  weekday: Weekday;
}
