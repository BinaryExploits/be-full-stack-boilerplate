# Logger Usage Guide

The logger is available throughout the application via dependency injection. You don't need to import `LoggerModule` in your modules - it's global.

## Features

- Framework-agnostic ILogger interface in core package
- NestJS integration with ConsoleLogger
- **Automatic Rollbar integration** - all logs are sent to Rollbar
- Configurable log levels
- Context support for structured logging

## Usage in Services

```typescript
import { Injectable } from '@nestjs/common';
import { NestJsLogger } from '../utils/logger/NestJsLogger';

@Injectable()
export class UserService {
  constructor(private readonly logger: NestJsLogger) {
    this.logger.setContext('UserService');
  }

  createUser(data: any) {
    this.logger.info('Creating new user', { userId: data.id });
    // Your logic here
    this.logger.debug('User created successfully');
  }
}
```

## Usage in Controllers

```typescript
import { Controller, Get } from '@nestjs/common';
import { NestJsLogger } from '../utils/logger/NestJsLogger';

@Controller('users')
export class UserController {
  constructor(private readonly logger: NestJsLogger) {
    this.logger.setContext('UserController');
  }

  @Get()
  findAll() {
    this.logger.log('Fetching all users');
    // Your logic here
  }
}
```

## Usage in Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NestJsLogger } from '../utils/logger/NestJsLogger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: NestJsLogger) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.url}`);
    next();
  }
}
```

## Available Methods

### ILogger Interface (Your Contract)
- `logger.error(message, context?)` - Log errors
- `logger.warn(message, context?)` - Log warnings
- `logger.info(message, context?)` - Log info messages
- `logger.debug(message, context?)` - Log debug messages
- `logger.trace(message, context?)` - Log trace messages
- `logger.log(level, message, context?)` - Log with specific level

### NestJS Logger Interface (Compatibility)
- `logger.log(message, context?)` - Standard NestJS log
- `logger.error(message, stack?, context?)` - NestJS error with stack trace
- `logger.warn(message, context?)` - NestJS warn
- `logger.debug(message, context?)` - NestJS debug
- `logger.verbose(message, context?)` - NestJS verbose (maps to trace)

## Configuration

Set the log level via environment variable:
```bash
LOG_LEVEL=DEBUG # Options: ERROR, WARN, INFO, DEBUG, TRACE
```

Default is `INFO`.

## Example with Context Object

```typescript
this.logger.info('User login attempt', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date()
});
```

## No Need to Import LoggerModule

The `LoggerModule` is marked as `@Global()`, so you don't need to add it to the imports of your feature modules. Just inject `NestJsLogger` directly!

## Rollbar Integration

All logs are automatically sent to Rollbar with appropriate severity levels:

- `error()` → Rollbar error
- `warn()` → Rollbar warning
- `info()` → Rollbar info
- `debug()` → Rollbar debug
- `trace()` → Rollbar debug (Rollbar doesn't have trace level)

Context objects are also sent to Rollbar as custom data:

```typescript
this.logger.error('Payment failed', {
  userId: user.id,
  amount: payment.amount,
  error: err.message
});
// This will appear in Rollbar with all context data
```

### Error Handling

If Rollbar fails to send logs, the logger will:
1. Log the failure to console.error
2. Continue with console logging (won't break your app)

This ensures your application continues to function even if Rollbar is unavailable.
