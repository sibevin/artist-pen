const RECENT_RANGE_TYPES = ["1w", "1m", "1q", "1h", "1y"] as const;
export type RecentRangeType = typeof RECENT_RANGE_TYPES[number];

export const RECENT_RANGE_DAYS_MAP: Record<RecentRangeType, number> = {
  "1w": 7,
  "1m": 30,
  "1q": 120,
  "1h": 180,
  "1y": 360,
};

export function getRecentRangeDays(mark: string): number | undefined {
  return RECENT_RANGE_DAYS_MAP[mark as RecentRangeType];
}
