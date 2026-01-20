export class DateExtensions {
  static FormatAsTimestamp(date: Date): string {
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  static hasDatePassed(date: Date): boolean;
  static hasDatePassed(
    date: Date,
    serverSyncThresholdSeconds?: number,
  ): boolean {
    const thresholdMs = serverSyncThresholdSeconds
      ? serverSyncThresholdSeconds * 1000
      : 0;

    const thresholdDateMs = date.getTime() + thresholdMs;
    return thresholdDateMs <= new Date().getTime();
  }
}
