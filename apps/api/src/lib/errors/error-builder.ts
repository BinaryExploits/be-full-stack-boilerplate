import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  PayloadTooLargeException,
  PreconditionFailedException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

/**
 * Severity levels for errors
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  NETWORK = 'network',
  FILE_OPERATION = 'file_operation',
  RATE_LIMIT = 'rate_limit',
  PAYMENT = 'payment',
  CONFIGURATION = 'configuration',
}

/**
 * Interface for field-level validation errors
 */
export interface FieldError {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

/**
 * Interface for error metadata
 */
export interface ErrorMetadata {
  code?: string;
  errorId?: string;
  timestamp?: Date;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  retryable?: boolean;
  retryAfter?: number;
  fields?: FieldError[];
  cause?: Error;
  context?: Record<string, unknown>;
  help?: string;
  documentation?: string;
  userId?: string;
  requestId?: string;
  stackTrace?: string;
  [key: string]: unknown;
}

/**
 * Interface for structured error response
 */
export interface ErrorResponse {
  message: string;
  timestamp: Date;
  code?: string;
  errorId?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  retryable?: boolean;
  retryAfter?: number;
  fields?: FieldError[];
  context?: Record<string, unknown>;
  help?: string;
  documentation?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Ultimate centralized error builder with comprehensive error handling capabilities.
 * Covers all HTTP status codes, validation, metadata, context building, and more.
 *
 * @example
 * // Basic usage
 * ErrorBuilder.notFound('User not found');
 *
 * @example
 * // With metadata
 * ErrorBuilder.notFound('User not found', {
 *   code: 'USER_NOT_FOUND',
 *   errorId: '12345',
 *   userId: 'user-123'
 * });
 *
 * @example
 * // Validation errors
 * ErrorBuilder.validationError([
 *   { field: 'email', message: 'Invalid email format' },
 *   { field: 'age', message: 'Must be 18 or older' }
 * ]);
 *
 * @example
 * // Conditional throwing
 * ErrorBuilder.throwIf(!user, () => ErrorBuilder.notFound('User not found'));
 *
 * @example
 * // Business logic errors
 * ErrorBuilder.businessLogic('Cannot delete account with active subscriptions', {
 *   code: 'ACTIVE_SUBSCRIPTIONS_EXIST',
 *   context: { subscriptionCount: 3 }
 * });
 */
export class ErrorBuilder {
  // ============================================================================
  // STANDARD HTTP ERRORS (4xx - Client Errors)
  // ============================================================================

  /**
   * Throws a 400 Bad Request exception
   * @param message - Error message describing the bad request
   * @param metadata - Additional error metadata
   */
  static badRequest(message: string, metadata?: ErrorMetadata): never {
    throw new BadRequestException(this.buildErrorResponse(message, metadata));
  }

  /**
   * Throws a 401 Unauthorized exception
   * @param message - Error message describing the authorization failure
   * @param metadata - Additional error metadata
   */
  static unauthorized(message: string, metadata?: ErrorMetadata): never {
    throw new UnauthorizedException(this.buildErrorResponse(message, metadata));
  }

  /**
   * Throws a 402 Payment Required exception
   * @param message - Error message describing payment requirement
   * @param metadata - Additional error metadata
   */
  static paymentRequired(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  /**
   * Throws a 403 Forbidden exception
   * @param message - Error message describing why access is forbidden
   * @param metadata - Additional error metadata
   */
  static forbidden(message: string, metadata?: ErrorMetadata): never {
    throw new ForbiddenException(this.buildErrorResponse(message, metadata));
  }

  /**
   * Throws a 404 Not Found exception
   * @param message - Error message describing what was not found
   * @param metadata - Additional error metadata
   */
  static notFound(message: string, metadata?: ErrorMetadata): never {
    throw new NotFoundException(this.buildErrorResponse(message, metadata));
  }

  /**
   * Throws a 405 Method Not Allowed exception
   * @param message - Error message describing the method not allowed
   * @param metadata - Additional error metadata
   */
  static methodNotAllowed(message: string, metadata?: ErrorMetadata): never {
    throw new MethodNotAllowedException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 406 Not Acceptable exception
   * @param message - Error message describing the not acceptable content
   * @param metadata - Additional error metadata
   */
  static notAcceptable(message: string, metadata?: ErrorMetadata): never {
    throw new NotAcceptableException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 407 Proxy Authentication Required exception
   * @param message - Error message describing proxy authentication requirement
   * @param metadata - Additional error metadata
   */
  static proxyAuthRequired(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.PROXY_AUTHENTICATION_REQUIRED,
    );
  }

  /**
   * Throws a 408 Request Timeout exception
   * @param message - Error message describing the timeout
   * @param metadata - Additional error metadata
   */
  static requestTimeout(message: string, metadata?: ErrorMetadata): never {
    throw new RequestTimeoutException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 409 Conflict exception
   * @param message - Error message describing the conflict
   * @param metadata - Additional error metadata
   */
  static conflict(message: string, metadata?: ErrorMetadata): never {
    throw new ConflictException(this.buildErrorResponse(message, metadata));
  }

  /**
   * Throws a 410 Gone exception
   * @param message - Error message describing what is gone
   * @param metadata - Additional error metadata
   */
  static gone(message: string, metadata?: ErrorMetadata): never {
    throw new GoneException(this.buildErrorResponse(message, metadata));
  }

  /**
   * Throws a 411 Length Required exception
   * @param message - Error message describing length requirement
   * @param metadata - Additional error metadata
   */
  static lengthRequired(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.LENGTH_REQUIRED,
    );
  }

  /**
   * Throws a 412 Precondition Failed exception
   * @param message - Error message describing the failed precondition
   * @param metadata - Additional error metadata
   */
  static preconditionFailed(message: string, metadata?: ErrorMetadata): never {
    throw new PreconditionFailedException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 413 Payload Too Large exception
   * @param message - Error message describing the payload size issue
   * @param metadata - Additional error metadata
   */
  static payloadTooLarge(message: string, metadata?: ErrorMetadata): never {
    throw new PayloadTooLargeException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 414 URI Too Long exception
   * @param message - Error message describing URI length issue
   * @param metadata - Additional error metadata
   */
  static uriTooLong(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.URI_TOO_LONG,
    );
  }

  /**
   * Throws a 415 Unsupported Media Type exception
   * @param message - Error message describing the unsupported media type
   * @param metadata - Additional error metadata
   */
  static unsupportedMediaType(
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new UnsupportedMediaTypeException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 416 Range Not Satisfiable exception
   * @param message - Error message describing range issue
   * @param metadata - Additional error metadata
   */
  static rangeNotSatisfiable(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
    );
  }

  /**
   * Throws a 417 Expectation Failed exception
   * @param message - Error message describing expectation failure
   * @param metadata - Additional error metadata
   */
  static expectationFailed(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.EXPECTATION_FAILED,
    );
  }

  /**
   * Throws a 418 I'm a teapot exception (Easter egg, but why not?)
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static imATeapot(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.I_AM_A_TEAPOT,
    );
  }

  /**
   * Throws a 421 Misdirected Request exception
   * @param message - Error message describing misdirected request
   * @param metadata - Additional error metadata
   */
  static misdirected(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.MISDIRECTED,
    );
  }

  /**
   * Throws a 422 Unprocessable Entity exception
   * @param message - Error message describing the unprocessable entity
   * @param metadata - Additional error metadata
   */
  static unprocessableEntity(message: string, metadata?: ErrorMetadata): never {
    throw new UnprocessableEntityException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 423 Locked exception
   * @param message - Error message describing the locked resource
   * @param metadata - Additional error metadata
   */
  static locked(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.LOCKED,
    );
  }

  /**
   * Throws a 424 Failed Dependency exception
   * @param message - Error message describing the failed dependency
   * @param metadata - Additional error metadata
   */
  static failedDependency(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.FAILED_DEPENDENCY,
    );
  }

  /**
   * Throws a 426 Upgrade Required exception
   * @param message - Error message describing upgrade requirement
   * @param metadata - Additional error metadata
   */
  static upgradeRequired(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), 426);
  }

  /**
   * Throws a 428 Precondition Required exception
   * @param message - Error message describing precondition requirement
   * @param metadata - Additional error metadata
   */
  static preconditionRequired(
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.PRECONDITION_REQUIRED,
    );
  }

  /**
   * Throws a 429 Too Many Requests exception
   * @param message - Error message describing rate limit
   * @param metadata - Additional error metadata (consider setting retryAfter)
   */
  static tooManyRequests(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /**
   * Throws a 431 Request Header Fields Too Large exception
   * @param message - Error message describing header size issue
   * @param metadata - Additional error metadata
   */
  static headersTooLarge(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), 431);
  }

  /**
   * Throws a 451 Unavailable For Legal Reasons exception
   * @param message - Error message describing legal restriction
   * @param metadata - Additional error metadata
   */
  static unavailableForLegalReasons(
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), 451);
  }

  // ============================================================================
  // STANDARD HTTP ERRORS (5xx - Server Errors)
  // ============================================================================

  /**
   * Throws a 500 Internal Server Error exception
   * @param message - Error message describing the internal error
   * @param metadata - Additional error metadata
   */
  static internalError(message: string, metadata?: ErrorMetadata): never {
    throw new InternalServerErrorException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 501 Not Implemented exception
   * @param message - Error message describing what's not implemented
   * @param metadata - Additional error metadata
   */
  static notImplemented(message: string, metadata?: ErrorMetadata): never {
    throw new NotImplementedException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 502 Bad Gateway exception
   * @param message - Error message describing the bad gateway
   * @param metadata - Additional error metadata
   */
  static badGateway(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.BAD_GATEWAY,
    );
  }

  /**
   * Throws a 503 Service Unavailable exception
   * @param message - Error message describing service unavailability
   * @param metadata - Additional error metadata
   */
  static serviceUnavailable(message: string, metadata?: ErrorMetadata): never {
    throw new ServiceUnavailableException(
      this.buildErrorResponse(message, metadata),
    );
  }

  /**
   * Throws a 504 Gateway Timeout exception
   * @param message - Error message describing the gateway timeout
   * @param metadata - Additional error metadata
   */
  static gatewayTimeout(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }

  /**
   * Throws a 505 HTTP Version Not Supported exception
   * @param message - Error message describing HTTP version issue
   * @param metadata - Additional error metadata
   */
  static httpVersionNotSupported(
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
    );
  }

  /**
   * Throws a 506 Variant Also Negotiates exception
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static variantAlsoNegotiates(
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), 506);
  }

  /**
   * Throws a 507 Insufficient Storage exception
   * @param message - Error message describing storage issue
   * @param metadata - Additional error metadata
   */
  static insufficientStorage(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.INSUFFICIENT_STORAGE,
    );
  }

  /**
   * Throws a 508 Loop Detected exception
   * @param message - Error message describing loop detection
   * @param metadata - Additional error metadata
   */
  static loopDetected(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, metadata),
      HttpStatus.LOOP_DETECTED,
    );
  }

  /**
   * Throws a 510 Not Extended exception
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static notExtended(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), 510);
  }

  /**
   * Throws a 511 Network Authentication Required exception
   * @param message - Error message describing network auth requirement
   * @param metadata - Additional error metadata
   */
  static networkAuthRequired(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), 511);
  }

  // ============================================================================
  // SPECIALIZED ERROR HELPERS
  // ============================================================================

  /**
   * Throws a validation error with detailed field-level errors
   * @param fields - Array of field errors
   * @param message - Optional custom message
   */
  static validationError(
    fields: FieldError[],
    message = 'Validation failed',
  ): never {
    throw new BadRequestException(
      this.buildErrorResponse(message, {
        fields,
        category: ErrorCategory.VALIDATION,
      }),
    );
  }

  /**
   * Throws a single field validation error
   * @param field - Field name
   * @param message - Error message
   * @param value - Optional field value
   */
  static fieldError(field: string, message: string, value?: unknown): never {
    this.validationError([{ field, message, value }]);
  }

  /**
   * Throws a database-related error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static databaseError(message: string, metadata?: ErrorMetadata): never {
    throw new InternalServerErrorException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.DATABASE,
      }),
    );
  }

  /**
   * Throws an external service error
   * @param service - Service name
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static externalServiceError(
    service: string,
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new ServiceUnavailableException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.EXTERNAL_SERVICE,
        context: { service, ...metadata?.context },
      }),
    );
  }

  /**
   * Throws a rate limit error
   * @param message - Error message
   * @param retryAfter - Seconds until retry is allowed
   * @param metadata - Additional error metadata
   */
  static rateLimitExceeded(
    message: string,
    retryAfter?: number,
    metadata?: ErrorMetadata,
  ): never {
    throw new HttpException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.RATE_LIMIT,
        retryAfter,
        retryable: true,
      }),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /**
   * Throws a business logic error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static businessLogic(message: string, metadata?: ErrorMetadata): never {
    throw new BadRequestException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.BUSINESS_LOGIC,
      }),
    );
  }

  /**
   * Throws a payment/billing related error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static paymentError(message: string, metadata?: ErrorMetadata): never {
    throw new HttpException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.PAYMENT,
      }),
      HttpStatus.PAYMENT_REQUIRED,
    );
  }

  /**
   * Throws a file operation error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static fileOperationError(message: string, metadata?: ErrorMetadata): never {
    throw new InternalServerErrorException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.FILE_OPERATION,
      }),
    );
  }

  /**
   * Throws a configuration error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static configurationError(message: string, metadata?: ErrorMetadata): never {
    throw new InternalServerErrorException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.CONFIGURATION,
        severity: ErrorSeverity.CRITICAL,
      }),
    );
  }

  /**
   * Throws a network error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static networkError(message: string, metadata?: ErrorMetadata): never {
    throw new ServiceUnavailableException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.NETWORK,
        retryable: true,
      }),
    );
  }

  /**
   * Throws an authentication error with context
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static authenticationError(message: string, metadata?: ErrorMetadata): never {
    throw new UnauthorizedException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.AUTHENTICATION,
      }),
    );
  }

  /**
   * Throws an authorization/permission error
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static authorizationError(message: string, metadata?: ErrorMetadata): never {
    throw new ForbiddenException(
      this.buildErrorResponse(message, {
        ...metadata,
        category: ErrorCategory.AUTHORIZATION,
      }),
    );
  }

  /**
   * Throws a duplicate resource error
   * @param resource - Resource name
   * @param identifier - Optional identifier of the duplicate
   * @param metadata - Additional error metadata
   */
  static duplicate(
    resource: string,
    identifier?: string,
    metadata?: ErrorMetadata,
  ): never {
    const message = identifier
      ? `${resource} with identifier '${identifier}' already exists`
      : `${resource} already exists`;

    throw new ConflictException(
      this.buildErrorResponse(message, {
        ...metadata,
        context: { resource, identifier, ...metadata?.context },
      }),
    );
  }

  /**
   * Throws a resource not found error with context
   * @param resource - Resource name
   * @param identifier - Optional identifier that was not found
   * @param metadata - Additional error metadata
   */
  static resourceNotFound(
    resource: string,
    identifier?: string,
    metadata?: ErrorMetadata,
  ): never {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    throw new NotFoundException(
      this.buildErrorResponse(message, {
        ...metadata,
        context: { resource, identifier, ...metadata?.context },
      }),
    );
  }

  /**
   * Throws a custom error with any HTTP status code
   * @param status - HTTP status code
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static custom(
    status: HttpStatus,
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    throw new HttpException(this.buildErrorResponse(message, metadata), status);
  }

  // ============================================================================
  // CONDITIONAL ERROR THROWING
  // ============================================================================

  /**
   * Throws an error if condition is true
   * @param condition - Condition to check
   * @param errorFactory - Function that throws the error
   */
  static throwIf(condition: boolean, errorFactory: () => never): void {
    if (condition) {
      errorFactory();
    }
  }

  /**
   * Throws an error if condition is false
   * @param condition - Condition to check
   * @param errorFactory - Function that throws the error
   */
  static throwUnless(condition: boolean, errorFactory: () => never): void {
    if (!condition) {
      errorFactory();
    }
  }

  /**
   * Throws not found if value is null or undefined
   * @param value - Value to check
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static throwIfNotFound<T>(
    value: T | null | undefined,
    message: string,
    metadata?: ErrorMetadata,
  ): asserts value is T {
    if (value === null || value === undefined) {
      this.notFound(message, metadata);
    }
  }

  /**
   * Throws forbidden if condition is true
   * @param condition - Condition to check
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static throwIfForbidden(
    condition: boolean,
    message: string,
    metadata?: ErrorMetadata,
  ): void {
    if (condition) {
      this.forbidden(message, metadata);
    }
  }

  /**
   * Throws unauthorized if condition is true
   * @param condition - Condition to check
   * @param message - Error message
   * @param metadata - Additional error metadata
   */
  static throwIfUnauthorized(
    condition: boolean,
    message: string,
    metadata?: ErrorMetadata,
  ): void {
    if (condition) {
      this.unauthorized(message, metadata);
    }
  }

  // ============================================================================
  // ERROR AGGREGATION
  // ============================================================================

  /**
   * Collects multiple errors and throws them together
   * Useful for batch validation or multiple operation failures
   * @param errors - Array of error messages or FieldError objects
   * @param message - Overall error message
   */
  static aggregateErrors(
    errors: (string | FieldError)[],
    message = 'Multiple errors occurred',
  ): never {
    const fields: FieldError[] = errors.map((error, index) =>
      typeof error === 'string'
        ? { field: `error_${index}`, message: error }
        : error,
    );

    this.validationError(fields, message);
  }

  // ============================================================================
  // ERROR WRAPPING AND TRANSFORMATION
  // ============================================================================

  /**
   * Wraps an unknown error into a structured error
   * @param error - The original error
   * @param message - Custom message
   * @param metadata - Additional error metadata
   */
  static wrap(
    error: unknown,
    message: string,
    metadata?: ErrorMetadata,
  ): never {
    const cause = error instanceof Error ? error : new Error(String(error));

    throw new InternalServerErrorException(
      this.buildErrorResponse(message, {
        ...metadata,
        cause,
        stackTrace: cause.stack,
      }),
    );
  }

  /**
   * Re-throws an error with additional context
   * @param error - The original error
   * @param additionalContext - Additional context to add
   */
  static rethrowWithContext(
    error: unknown,
    additionalContext: Record<string, unknown>,
  ): never {
    if (error instanceof HttpException) {
      const response = error.getResponse();

      let existingContext: Record<string, unknown> = {};
      if (
        typeof response === 'object' &&
        response !== null &&
        'context' in response
      ) {
        const ctx = (response as Record<string, unknown>).context;
        existingContext =
          typeof ctx === 'object' && ctx !== null
            ? (ctx as Record<string, unknown>)
            : {};
      }

      throw new HttpException(
        {
          ...(typeof response === 'object' ? response : { message: response }),
          context: { ...existingContext, ...additionalContext },
        },
        error.getStatus(),
      );
    }

    this.wrap(error, 'An error occurred', { context: additionalContext });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generates a unique error ID
   */
  static generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Creates an error metadata builder for fluent API
   */
  static metadata(): ErrorMetadataBuilder {
    return new ErrorMetadataBuilder();
  }

  /**
   * Builds a structured error response with metadata
   * @param message - Error message
   * @param metadata - Error metadata
   */
  private static buildErrorResponse(
    message: string,
    metadata?: ErrorMetadata,
  ): string | ErrorResponse {
    if (!metadata || Object.keys(metadata).length === 0) {
      return message;
    }

    const response: ErrorResponse = {
      message,
      timestamp: metadata.timestamp || new Date(),
    };

    if (metadata.code) response.code = metadata.code;
    if (metadata.errorId) response.errorId = metadata.errorId;
    if (metadata.severity) response.severity = metadata.severity;
    if (metadata.category) response.category = metadata.category;
    if (metadata.retryable !== undefined)
      response.retryable = metadata.retryable;
    if (metadata.retryAfter) response.retryAfter = metadata.retryAfter;
    if (metadata.fields) response.fields = metadata.fields;
    if (metadata.context) response.context = metadata.context;
    if (metadata.help) response.help = metadata.help;
    if (metadata.documentation) response.documentation = metadata.documentation;
    if (metadata.userId) response.userId = metadata.userId;
    if (metadata.requestId) response.requestId = metadata.requestId;

    // Add any additional custom metadata
    Object.keys(metadata).forEach((key) => {
      if (
        ![
          'code',
          'errorId',
          'timestamp',
          'severity',
          'category',
          'retryable',
          'retryAfter',
          'fields',
          'cause',
          'context',
          'help',
          'documentation',
          'userId',
          'requestId',
          'stackTrace',
        ].includes(key)
      ) {
        response[key] = metadata[key];
      }
    });

    return response;
  }
}

/**
 * Fluent builder for error metadata
 *
 * @example
 * ErrorBuilder.notFound('User not found',
 *   ErrorBuilder.metadata()
 *     .code('USER_NOT_FOUND')
 *     .severity(ErrorSeverity.MEDIUM)
 *     .retryable(false)
 *     .context({ userId: '123' })
 *     .build()
 * );
 */
export class ErrorMetadataBuilder {
  private metadata: ErrorMetadata = {};

  code(code: string): this {
    this.metadata.code = code;
    return this;
  }

  errorId(errorId: string): this {
    this.metadata.errorId = errorId;
    return this;
  }

  generateErrorId(): this {
    this.metadata.errorId = ErrorBuilder.generateErrorId();
    return this;
  }

  timestamp(timestamp: Date): this {
    this.metadata.timestamp = timestamp;
    return this;
  }

  severity(severity: ErrorSeverity): this {
    this.metadata.severity = severity;
    return this;
  }

  category(category: ErrorCategory): this {
    this.metadata.category = category;
    return this;
  }

  retryable(retryable: boolean): this {
    this.metadata.retryable = retryable;
    return this;
  }

  retryAfter(seconds: number): this {
    this.metadata.retryAfter = seconds;
    return this;
  }

  fields(fields: FieldError[]): this {
    this.metadata.fields = fields;
    return this;
  }

  addField(field: FieldError): this {
    if (!this.metadata.fields) {
      this.metadata.fields = [];
    }
    this.metadata.fields.push(field);
    return this;
  }

  cause(cause: Error): this {
    this.metadata.cause = cause;
    return this;
  }

  context(context: Record<string, unknown>): this {
    this.metadata.context = { ...this.metadata.context, ...context };
    return this;
  }

  help(help: string): this {
    this.metadata.help = help;
    return this;
  }

  documentation(url: string): this {
    this.metadata.documentation = url;
    return this;
  }

  userId(userId: string): this {
    this.metadata.userId = userId;
    return this;
  }

  requestId(requestId: string): this {
    this.metadata.requestId = requestId;
    return this;
  }

  custom(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  build(): ErrorMetadata {
    return this.metadata;
  }
}
