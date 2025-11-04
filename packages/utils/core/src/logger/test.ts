export interface UniversalLogger {
  info(message: any): void;
  info(message: any, context: string): void;
  info(message: any, context: string, ...optionalParams: any[]): void;
  info(message: any, ...optionalParams: any[]): void;

  warn(message: any): void;
  warn(message: any, context: string): void;
  warn(message: any, context: string, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: any[]): void;

  debug(message: any): void;
  debug(message: any, context: string): void;
  debug(message: any, context: string, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: any[]): void;

  verbose(message: any): void;
  verbose(message: any, context: string): void;
  verbose(message: any, context: string, ...optionalParams: any[]): void;
  verbose(message: any, ...optionalParams: any[]): void;

  error(message: any): void;
  error(message: any, stack: string): void;
  error(message: any, stack: string, context: string): void;
  error(message: any, stack: string, context: string, ...optionalParams: any[]): void;
  error(message: any, context: string): void;
  error(message: any, context: string, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
}

/* ------------------------------------------------------------------
 * 2️⃣ Implementation: BrowserConsoleLogger
 * ------------------------------------------------------------------ */
export class BrowserConsoleLogger implements UniversalLogger {
  info(message: any): void;
  info(message: any, context: string): void;
  info(message: any, context: string, ...optionalParams: any[]): void;
  info(message: any, ...optionalParams: any[]): void;
  info(message: any, context?: any, ...optionalParams: any[]): void {
    this.writeLog("info", message, context, optionalParams);
  }

  warn(message: any): void;
  warn(message: any, context: string): void;
  warn(message: any, ...optionalParams: any[]): void;
  warn(message: any, context: string, ...optionalParams: any[]): void;
  warn(message: any, context?: any, ...optionalParams: any[]): void {
    this.writeLog("warn", message, context, optionalParams);
  }

  debug(message: any): void;
  debug(message: any, context: string): void;
  debug(message: any, ...optionalParams: any[]): void;
  debug(message: any, context: string, ...optionalParams: any[]): void;
  debug(message: any, context?: any, ...optionalParams: any[]): void {
    this.writeLog("debug", message, context, optionalParams);
  }

  verbose(message: any): void;
  verbose(message: any, context: string): void;
  verbose(message: any, ...optionalParams: any[]): void;
  verbose(message: any, context: string, ...optionalParams: any[]): void;
  verbose(message: any, context?: any, ...optionalParams: any[]): void {
    this.writeLog("verbose", message, context, optionalParams);
  }

  error(message: any): void;
  error(message: any, context: string): void;
  error(message: any, ...optionalParams: any[]): void;
  error(message: any, context: string, ...optionalParams: any[]): void;
  error(message: any, stack: string): void;
  error(message: any, stack: string, context: string): void;
  error(
    message: any,
    stack: string,
    context: string,
    ...optionalParams: any[]
  ): void;
  error(
    message: unknown,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    // throw new Error("Method not implemented.");
  }

  private writeLog(
    level: "info" | "error" | "warn" | "debug" | "verbose",
    message: any,
    context?: string,
    ...optionalParams: any[]
  ) {
    const prefix = context ? `[${context}] ` : "";
    const text = `${prefix}${message}`;

    switch (level) {
      case "info":
        console.log(text, optionalParams);
        break;
      case "warn":
        console.warn(text, optionalParams);
        break;
      case "debug":
        console.debug(text, optionalParams);
        break;
      case "verbose":
        console.info(text, optionalParams);
        break;
      case "error":
        console.error(text, optionalParams);
        break;
      default:
        break;
    }
  }
}

export function testLoggerUsage() {
  const logger = new BrowserConsoleLogger();

  // INFO
  logger.info("Application started");
  logger.info("Application started", "Bootstrap");
  logger.info("Application started", "Bootstrap");
  logger.info("User loaded", { id: 123 });
  logger.info("User loaded", "UserService", { id: 123 }, "Extra param");

  // WARN
  logger.warn("Low memory");
  logger.warn("Low memory", "SystemMonitor");
  logger.warn("Cache nearing full capacity", { used: 90 });
  logger.warn("Cache nearing full capacity", "CacheService", { used: 90 });

  // DEBUG
  logger.debug("Debugging step 1");
  logger.debug("Debugging step 1", "Debugger");
  logger.debug("User auth token", { token: "abc123" });
  logger.debug("User auth token", "AuthService", { token: "abc123" });

  // VERBOSE
  logger.verbose("Fetching API data");
  logger.verbose("Fetching API data", "NetworkLayer");
  logger.verbose("Detailed network info", { latency: 120 });
  logger.verbose("Detailed network info", "NetworkLayer", { latency: 120 });

  // ERROR
  logger.error("Something went wrong");
  logger.error("Something went wrong", "ErrorService");
  logger.error("Something went wrong", "ErrorService", { code: 500 });
  logger.error("Unhandled exception", "Error: Stack trace here...");
  logger.error("Unhandled exception", "Error: Stack trace here...", "MainApp");
  logger.error("Unhandled exception", "Error: Stack trace here...", "MainApp", { retry: false });
}

// Run demo (optional)
if (require.main === module) {
  testLoggerUsage();
}
