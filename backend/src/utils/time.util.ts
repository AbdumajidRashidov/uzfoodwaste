// src/utils/time.util.ts

/**
 * Calculates the remaining hours until a given end time
 * @param endTime - The target end time
 * @param startTime - Optional start time (defaults to current time)
 * @returns Number of hours remaining (rounded up), or 0 if the end time has passed
 */
export const calculateRemainingHours = (
  endTime: Date,
  startTime: Date = new Date()
): number => {
  const timeDiff = endTime.getTime() - startTime.getTime();
  const hoursDiff = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60)));
  return hoursDiff;
};

/**
 * Formats remaining hours into a human-readable string
 * @param hours - Number of hours remaining
 * @returns Formatted string (e.g., "2 hours remaining" or "Less than 1 hour remaining")
 */
export const formatRemainingTime = (hours: number): string => {
  if (hours === 0) {
    return "Time expired";
  }
  if (hours < 1) {
    return "Less than 1 hour remaining";
  }
  return `${hours} hour${hours === 1 ? "" : "s"} remaining`;
};

/**
 * Determines if pickup time is urgent (less than 2 hours remaining)
 * @param endTime - The pickup end time
 * @param startTime - Optional start time (defaults to current time)
 * @returns Boolean indicating if pickup is urgent
 */
export const isPickupUrgent = (
  endTime: Date,
  startTime: Date = new Date()
): boolean => {
  const remainingHours = calculateRemainingHours(endTime, startTime);
  return remainingHours > 0 && remainingHours <= 2;
};

/**
 * Categorizes remaining pickup time into status levels
 * @param endTime - The pickup end time
 * @param startTime - Optional start time (defaults to current time)
 * @returns 'expired' | 'urgent' | 'warning' | 'normal'
 */
export const getPickupTimeStatus = (
  endTime: Date,
  startTime: Date = new Date()
): string => {
  const remainingHours = calculateRemainingHours(endTime, startTime);

  if (remainingHours === 0) return "expired";
  if (remainingHours <= 2) return "urgent";
  if (remainingHours <= 4) return "warning";
  return "normal";
};

/**
 * Checks if a listing's pickup time has expired
 * @param endTime - The pickup end time
 * @param startTime - Optional start time (defaults to current time)
 * @returns Boolean indicating if pickup time has expired
 */
export const isPickupExpired = (
  endTime: Date,
  startTime: Date = new Date()
): boolean => {
  return calculateRemainingHours(endTime, startTime) === 0;
};
