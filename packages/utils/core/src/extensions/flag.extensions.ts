export class FlagExtensions {
  /**
   * Check if value has the flag set
   */
  static has(value: number, flag: number): boolean {
    return (value & flag) === flag;
  }

  /**
   * Add (enable) a flag
   */
  static add(value: number, flag: number): number {
    return value | flag;
  }

  /**
   * Remove (disable) a flag
   */
  static remove(value: number, flag: number): number {
    return value & ~flag;
  }

  /**
   * Parse a string (like "Info") into a numeric flag value.
   * Returns 0 if not found.
   */
  static parseString<T extends Record<string, string | number>>(
    input: string | undefined,
    enumObj: T,
  ): T[keyof T] {
    if (!input?.trim()) return 0 as T[keyof T];
    const flagVal: T[keyof T] = enumObj[input.trim() as keyof T];
    return (typeof flagVal === "number" ? flagVal : 0) as T[keyof T];
  }

  /**
   * Parse a numeric flag into its string name.
   * Returns an empty string if not found.
   */
  static parseFlag<T extends Record<string, string | number>>(
    input: number,
    enumObj: T,
  ): string {
    for (const [key, val] of Object.entries(enumObj)) {
      if (typeof val === "number" && val === input) {
        return key;
      }
    }
    return "";
  }

  /**
   * Return an array of string names for all active flags in a combined value
   */
  static describe<T extends Record<string, string | number>>(
    value: number,
    enumObj: T,
  ): string[] {
    const result: string[] = [];
    for (const [key, val] of Object.entries(enumObj)) {
      if (typeof val === "number" && val !== 0 && this.has(value, val)) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Convert a comma-separated string ("Info, Warn") into a combined flag value
   */
  static fromStringList<T extends Record<string, string | number>>(
    str: string | undefined,
    enumObj: T,
  ): T[keyof T] {
    if (!str?.trim()) return 0 as T[keyof T];
    const names: string[] = str.split(",").map((s) => s.trim());
    let value: number = 0;

    for (const name of names) {
      const flagVal: T[keyof T] = this.parseString(name, enumObj);
      value |= Number(flagVal);
    }

    return value as T[keyof T];
  }

  /**
   * Convert a combined flag value into a comma-separated string
   */
  static toStringList<T extends Record<string, string | number>>(
    value: number,
    enumObj: T,
  ): string {
    const parts: string[] = this.describe(value, enumObj).map((key) =>
      this.parseFlag(enumObj[key] as number, enumObj),
    );
    return parts.filter(Boolean).join(", ");
  }
}
