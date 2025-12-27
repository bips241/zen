/**
 * Daily Tracking Utilities
 *
 * Helper functions for managing daily progress tracking
 */

/**
 * Get the current day's date key based on refresh time
 * If current time is before refresh time, returns yesterday's date
 */
export const getTodayDateKey = (refreshTime: string): string => {
  const now = new Date();
  const [refreshHour, refreshMinute] = refreshTime.split(":").map(Number);

  // Create a date object for today's refresh time
  const refreshDate = new Date(now);
  refreshDate.setHours(refreshHour, refreshMinute, 0, 0);

  // If current time is before refresh time, we're still in "yesterday"
  if (now < refreshDate) {
    now.setDate(now.getDate() - 1);
  }

  return now.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Format refresh time for display
 */
export const formatRefreshTime = (time: string): string => {
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);

  if (hourNum === 0) return "Midnight";
  if (hourNum === 12) return "Noon";

  const period = hourNum < 12 ? "AM" : "PM";
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;

  return `${displayHour}:${minute} ${period}`;
};

/**
 * Get time until next daily reset
 */
export const getTimeUntilReset = (refreshTime: string): string => {
  const now = new Date();
  const [refreshHour, refreshMinute] = refreshTime.split(":").map(Number);

  const nextRefresh = new Date(now);
  nextRefresh.setHours(refreshHour, refreshMinute, 0, 0);

  // If refresh time has passed today, set to tomorrow
  if (now >= nextRefresh) {
    nextRefresh.setDate(nextRefresh.getDate() + 1);
  }

  const diff = nextRefresh.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get date keys for the past N days
 */
export const getDateKeysForPastDays = (
  days: number,
  refreshTime: string
): string[] => {
  const keys: string[] = [];
  const today = getTodayDateKey(refreshTime);
  const todayDate = new Date(today);

  for (let i = 0; i < days; i++) {
    const date = new Date(todayDate);
    date.setDate(date.getDate() - i);
    keys.push(date.toISOString().split("T")[0]);
  }

  return keys;
};
