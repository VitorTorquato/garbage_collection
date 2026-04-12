export interface CollectionDayResponse {
  type: string;
  weekdays: string[];
  startTime: string | null;
  notes: string | null;
}

export interface ScheduleResponse {
  city: string;
  state: string;
  country: string;
  neighborhood: string | null;
  source: string;
  confidence: string;
  expiresAt: string;
  days: CollectionDayResponse[];
}
