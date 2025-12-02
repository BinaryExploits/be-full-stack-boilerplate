import { ConsoleLogger } from '@nestjs/common';
import { RollbarService } from '@andeanwide/nestjs-rollbar';
import NestJsLogger from './logger-nestjs';
import { LogLevel } from '@repo/utils-core';

// AI Generated Test
describe('NestJsLogger', () => {
  let logger: NestJsLogger;
  let consoleLogger: ConsoleLogger;
  let rollbarService: Partial<RollbarService>;
  let setContextSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let verboseSpy: jest.SpyInstance;
  let rollbarInfoSpy: jest.SpyInstance;
  let rollbarWarnSpy: jest.SpyInstance;
  let rollbarErrorSpy: jest.SpyInstance;
  let rollbarLogSpy: jest.SpyInstance;
  let rollbarCriticalSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create a real ConsoleLogger instance and spy on its methods
    consoleLogger = new ConsoleLogger();
    setContextSpy = jest.spyOn(consoleLogger, 'setContext');
    logSpy = jest.spyOn(consoleLogger, 'log').mockImplementation();
    warnSpy = jest.spyOn(consoleLogger, 'warn').mockImplementation();
    errorSpy = jest.spyOn(consoleLogger, 'error').mockImplementation();
    debugSpy = jest.spyOn(consoleLogger, 'debug').mockImplementation();
    verboseSpy = jest.spyOn(consoleLogger, 'verbose').mockImplementation();

    // Create a rollbar service with mocked methods
    rollbarService = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      critical: jest.fn(),
    };
    rollbarInfoSpy = rollbarService.info as jest.Mock;
    rollbarWarnSpy = rollbarService.warn as jest.Mock;
    rollbarErrorSpy = rollbarService.error as jest.Mock;
    rollbarLogSpy = rollbarService.log as jest.Mock;
    rollbarCriticalSpy = rollbarService.critical as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      logger = new NestJsLogger(
        LogLevel.Info,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      expect(setContextSpy).toHaveBeenCalledWith('TestContext');
    });

    it('should initialize without rollbar', () => {
      logger = new NestJsLogger(
        LogLevel.Info,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
      );

      expect(setContextSpy).toHaveBeenCalledWith('TestContext');
    });
  });

  describe('info', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Info | LogLevel.Warn | LogLevel.Error,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should log info message to console', () => {
      logger.info('Test info message');

      expect(logSpy).toHaveBeenCalledWith('Test info message', 'TestContext');
    });

    it('should log info message with optional params', () => {
      logger.info('Test info message', { key: 'value' }, 'extra');

      expect(logSpy).toHaveBeenCalledWith(
        'Test info message',
        { key: 'value' },
        'extra',
        'TestContext',
      );
    });

    it('should not send to rollbar when log level is below threshold', () => {
      logger.info('Test info message');

      expect(rollbarInfoSpy).not.toHaveBeenCalled();
    });

    it('should send to rollbar when log level meets threshold', () => {
      logger = new NestJsLogger(
        LogLevel.Info,
        LogLevel.Info | LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      logger.info('Test info message');

      expect(rollbarInfoSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TestContext]', 'Test info message']),
      );
    });

    it('should not log when log level is not enabled', () => {
      logger = new NestJsLogger(
        LogLevel.Error,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      logger.info('Test info message');

      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Info | LogLevel.Warn | LogLevel.Error,
        LogLevel.Warn | LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should log warn message to console', () => {
      logger.warn('Test warn message');

      expect(warnSpy).toHaveBeenCalledWith('Test warn message', 'TestContext');
    });

    it('should send to rollbar', () => {
      logger.warn('Test warn message');

      expect(rollbarWarnSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TestContext]', 'Test warn message']),
      );
    });
  });

  describe('debug', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should log debug message to console', () => {
      logger.debug('Test debug message');

      expect(debugSpy).toHaveBeenCalledWith(
        'Test debug message',
        'TestContext',
      );
    });

    it('should send to rollbar when enabled', () => {
      logger = new NestJsLogger(
        LogLevel.Debug,
        LogLevel.Debug,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      logger.debug('Test debug message');

      expect(rollbarLogSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TestContext]', 'Test debug message']),
      );
    });
  });

  describe('trace', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Trace |
          LogLevel.Debug |
          LogLevel.Info |
          LogLevel.Warn |
          LogLevel.Error,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should log trace message to console using verbose', () => {
      logger.trace('Test trace message');

      expect(verboseSpy).toHaveBeenCalledWith(
        'Test trace message',
        'TestContext',
      );
    });

    it('should send to rollbar as log when enabled', () => {
      logger = new NestJsLogger(
        LogLevel.Trace,
        LogLevel.Trace,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      logger.trace('Test trace message');

      expect(rollbarLogSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TestContext]', 'Test trace message']),
      );
    });
  });

  describe('error', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Error,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should log error message without stack', () => {
      logger.error('Test error message');

      expect(errorSpy).toHaveBeenCalledWith(
        'Test error message',
        'TestContext',
      );
    });

    it('should log error message with stack', () => {
      const stack = 'Error stack trace';
      logger.error('Test error message', stack);

      expect(errorSpy).toHaveBeenCalledWith(
        'Test error message',
        stack,
        'TestContext',
      );
    });

    it('should log error message with stack and optional params', () => {
      const stack = 'Error stack trace';
      logger.error('Test error message', stack, 'extra param');

      expect(errorSpy).toHaveBeenCalledWith(
        'Test error message',
        'extra param',
        stack,
        'TestContext',
      );
    });

    it('should send to rollbar', () => {
      logger.error('Test error message');

      expect(rollbarErrorSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TestContext]', 'Test error message', undefined]),
      );
    });

    it('should not log when error level is not enabled', () => {
      logger = new NestJsLogger(
        LogLevel.Info,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      logger.error('Test error message');

      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('critical', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Critical,
        LogLevel.Critical,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should log critical message to console', () => {
      logger.critical('Test critical message');

      expect(errorSpy).toHaveBeenCalledWith(
        'Test critical message',
        'TestContext',
      );
    });

    it('should send to rollbar as critical', () => {
      logger.critical('Test critical message');

      expect(rollbarCriticalSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TestContext]', 'Test critical message', undefined]),
      );
    });
  });

  describe('context handling', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Info,
        LogLevel.Info,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should use temp context when set', () => {
      logger.withContext('TempContext').info('Test message');

      expect(logSpy).toHaveBeenCalledWith('Test message', 'TempContext');
    });

    it('should clear temp context after logging', () => {
      logger.withContext('TempContext').info('Test message 1');
      logger.info('Test message 2');

      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        'Test message 1',
        'TempContext',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Test message 2',
        'TestContext',
      );
    });

    it('should include temp context in rollbar message', () => {
      logger.withContext('TempContext').info('Test message');

      expect(rollbarInfoSpy).toHaveBeenCalledWith(
        JSON.stringify(['[TempContext]', 'Test message']),
      );
    });
  });

  describe('rollbar error handling', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Info | LogLevel.Error,
        LogLevel.Info,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );
    });

    it('should handle rollbar errors gracefully', () => {
      rollbarInfoSpy.mockImplementation(() => {
        throw new Error('Rollbar error');
      });

      // Should not throw
      expect(() => {
        logger.info('Test message');
      }).not.toThrow();

      // Should log the rollbar error to the console
      expect(errorSpy).toHaveBeenCalledWith(
        'Rollbar error',
        expect.any(String),
        'Rollbar',
      );
    });
  });

  describe('without rollbar instance', () => {
    beforeEach(() => {
      logger = new NestJsLogger(
        LogLevel.Info,
        LogLevel.Info,
        'TestContext',
        consoleLogger,
      );
    });

    it('should log to console without sending to rollbar', () => {
      logger.info('Test message');

      expect(logSpy).toHaveBeenCalledWith('Test message', 'TestContext');
      // Rollbar should not be called since it's undefined
    });
  });

  describe('log level filtering', () => {
    it('should respect console log level flags', () => {
      // Only enable Info and Error
      logger = new NestJsLogger(
        LogLevel.Info | LogLevel.Error,
        LogLevel.None,
        'TestContext',
        consoleLogger,
      );

      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should respect rollbar log level flags', () => {
      // Enable all consoles, but only Error for rollbar
      logger = new NestJsLogger(
        LogLevel.Info | LogLevel.Warn | LogLevel.Error,
        LogLevel.Error,
        'TestContext',
        consoleLogger,
        rollbarService as RollbarService,
      );

      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(rollbarInfoSpy).not.toHaveBeenCalled();
      expect(rollbarWarnSpy).not.toHaveBeenCalled();
      expect(rollbarErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
