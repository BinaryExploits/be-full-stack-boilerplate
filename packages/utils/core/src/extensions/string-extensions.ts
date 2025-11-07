export class StringExtensions {
  static IsNullOrEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim().length === 0;
  }
}
