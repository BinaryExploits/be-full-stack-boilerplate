export class SeedLogger {
  private static readonly COLORS = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    gray: "\x1b[90m",
  };

  private static readonly PREFIX = "[SEED_PRISMA]";

  static log(message: unknown, context?: string): void {
    console.log(
      this.formatMessage(
        this.COLORS.blue,
        message,
        context,
        this.COLORS.magenta,
      ),
    );
  }

  static success(message: unknown, context?: string): void {
    console.log(
      this.formatMessage(
        this.COLORS.green,
        message,
        context,
        this.COLORS.magenta,
      ),
    );
  }

  static error(message: unknown, context?: string): void {
    console.error(
      this.formatMessage(this.COLORS.red, message, context, this.COLORS.red),
    );
  }

  static warn(message: unknown, context?: string): void {
    console.warn(
      this.formatMessage(
        this.COLORS.yellow,
        message,
        context,
        this.COLORS.yellow,
      ),
    );
  }

  static info(message: unknown, context?: string): void {
    console.info(
      this.formatMessage(
        this.COLORS.cyan,
        message,
        context,
        this.COLORS.magenta,
      ),
    );
  }

  static separator(): void {
    console.log(this.COLORS.gray + "─".repeat(60) + this.COLORS.reset);
  }

  static step(stepNumber: number, message: string): void {
    const prefixPart = `${this.COLORS.cyan}${this.PREFIX}${this.COLORS.reset}`;
    const stepPart = ` ${this.COLORS.yellow}[Step ${stepNumber}]${this.COLORS.reset}`;
    const messagePart = ` ${this.COLORS.blue}${message}${this.COLORS.reset}`;

    console.log(`${prefixPart}${stepPart}${messagePart}`);
  }

  private static formatMessage(
    messageColor: string,
    message: unknown,
    context?: string,
    contextColor?: string,
  ): string {
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);

    const prefixPart = `${this.COLORS.cyan}${this.PREFIX}${this.COLORS.reset}`;

    const contextPart = context
      ? ` ${contextColor || this.COLORS.magenta}[${context}]${this.COLORS.reset}`
      : "";

    const messagePart = ` ${messageColor}${messageStr}${this.COLORS.reset}`;
    return `${prefixPart}${contextPart}${messagePart}`;
  }
}
