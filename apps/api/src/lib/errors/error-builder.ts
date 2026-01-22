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
 * Centralized error builder with comprehensive error handling capabilities.
 *
 * @example
 * // Basic usage
 * ErrorBuilder.notFound('User not found');
 *
 * @example
 * // Conditional throwing
 * ErrorBuilder.throwIf(!user, () => ErrorBuilder.notFound('User not found'));
 *
 */
export class ErrorBuilder {
  // ============================================================================
  // STANDARD HTTP ERRORS (4xx - Client Errors)
  // ============================================================================

  /**
   * Throws a 400 Bad Request exception
   * @param message - Error message describing the bad request
   */
  static badRequest(message: string): never {
    throw new BadRequestException(message);
  }

  /**
   * Throws a 401 Unauthorized exception
   * @param message - Error message describing the authorization failure
   */
  static unauthorized(message: string): never {
    throw new UnauthorizedException(message);
  }

  /**
   * Throws a 402 Payment Required exception
   * @param message - Error message describing payment requirement
   */
  static paymentRequired(message: string): never {
    throw new HttpException(message, HttpStatus.PAYMENT_REQUIRED);
  }

  /**
   * Throws a 403 Forbidden exception
   * @param message - Error message describing why access is forbidden
   */
  static forbidden(message: string): never {
    throw new ForbiddenException(message);
  }

  /**
   * Throws a 404 Not Found exception
   * @param message - Error message describing what was not found
   */
  static notFound(message: string): never {
    throw new NotFoundException(message);
  }

  /**
   * Throws a 405 Method Not Allowed exception
   * @param message - Error message describing the method not allowed
   */
  static methodNotAllowed(message: string): never {
    throw new MethodNotAllowedException(message);
  }

  /**
   * Throws a 406 Not Acceptable exception
   * @param message - Error message describing the not acceptable content
   */
  static notAcceptable(message: string): never {
    throw new NotAcceptableException(message);
  }

  /**
   * Throws a 407 Proxy Authentication Required exception
   * @param message - Error message describing proxy authentication requirement
   */
  static proxyAuthRequired(message: string): never {
    throw new HttpException(message, HttpStatus.PROXY_AUTHENTICATION_REQUIRED);
  }

  /**
   * Throws a 408 Request Timeout exception
   * @param message - Error message describing the timeout
   */
  static requestTimeout(message: string): never {
    throw new RequestTimeoutException(message);
  }

  /**
   * Throws a 409 Conflict exception
   * @param message - Error message describing the conflict
   */
  static conflict(message: string): never {
    throw new ConflictException(message);
  }

  /**
   * Throws a 410 Gone exception
   * @param message - Error message describing what is gone
   */
  static gone(message: string): never {
    throw new GoneException(message);
  }

  /**
   * Throws a 411 Length Required exception
   * @param message - Error message describing length requirement
   */
  static lengthRequired(message: string): never {
    throw new HttpException(message, HttpStatus.LENGTH_REQUIRED);
  }

  /**
   * Throws a 412 Precondition Failed exception
   * @param message - Error message describing the failed precondition
   */
  static preconditionFailed(message: string): never {
    throw new PreconditionFailedException(message);
  }

  /**
   * Throws a 413 Payload Too Large exception
   * @param message - Error message describing the payload size issue
   */
  static payloadTooLarge(message: string): never {
    throw new PayloadTooLargeException(message);
  }

  /**
   * Throws a 414 URI Too Long exception
   * @param message - Error message describing URI length issue
   */
  static uriTooLong(message: string): never {
    throw new HttpException(message, HttpStatus.URI_TOO_LONG);
  }

  /**
   * Throws a 415 Unsupported Media Type exception
   * @param message - Error message describing the unsupported media type
   */
  static unsupportedMediaType(message: string): never {
    throw new UnsupportedMediaTypeException(message);
  }

  /**
   * Throws a 416 Range Not Satisfiable exception
   * @param message - Error message describing range issue
   */
  static rangeNotSatisfiable(message: string): never {
    throw new HttpException(
      message,
      HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
    );
  }

  /**
   * Throws a 417 Expectation Failed exception
   * @param message - Error message describing expectation failure
   */
  static expectationFailed(message: string): never {
    throw new HttpException(message, HttpStatus.EXPECTATION_FAILED);
  }

  /**
   * Throws a 418 I'm a teapot exception (Easter egg, but why not?)
   * @param message - Error message
   */
  static imATeapot(message: string): never {
    throw new HttpException(message, HttpStatus.I_AM_A_TEAPOT);
  }

  /**
   * Throws a 421 Misdirected Request exception
   * @param message - Error message describing misdirected request
   */
  static misdirected(message: string): never {
    throw new HttpException(message, HttpStatus.MISDIRECTED);
  }

  /**
   * Throws a 422 Unprocessable Entity exception
   * @param message - Error message describing the unprocessable entity
   */
  static unprocessableEntity(message: string): never {
    throw new UnprocessableEntityException(message);
  }

  /**
   * Throws a 423 Locked exception
   * @param message - Error message describing the locked resource
   */
  static locked(message: string): never {
    throw new HttpException(message, HttpStatus.LOCKED);
  }

  /**
   * Throws a 424 Failed Dependency exception
   * @param message - Error message describing the failed dependency
   */
  static failedDependency(message: string): never {
    throw new HttpException(message, HttpStatus.FAILED_DEPENDENCY);
  }

  /**
   * Throws a 426 Upgrade Required exception
   * @param message - Error message describing upgrade requirement
   */
  static upgradeRequired(message: string): never {
    throw new HttpException(message, 426);
  }

  /**
   * Throws a 428 Precondition Required exception
   * @param message - Error message describing precondition requirement
   */
  static preconditionRequired(message: string): never {
    throw new HttpException(message, HttpStatus.PRECONDITION_REQUIRED);
  }

  /**
   * Throws a 429 Too Many Requests exception
   * @param message - Error message describing rate limit
    (consider setting retryAfter)
   */
  static tooManyRequests(message: string): never {
    throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  /**
   * Throws a 431 Request Header Fields Too Large exception
   * @param message - Error message describing header size issue
   */
  static headersTooLarge(message: string): never {
    throw new HttpException(message, 431);
  }

  /**
   * Throws a 451 Unavailable For Legal Reasons exception
   * @param message - Error message describing legal restriction
   */
  static unavailableForLegalReasons(message: string): never {
    throw new HttpException(message, 451);
  }

  // ============================================================================
  // STANDARD HTTP ERRORS (5xx - Server Errors)
  // ============================================================================

  /**
   * Throws a 500 Internal Server Error exception
   * @param message - Error message describing the internal error
   */
  static internalError(message: string): never {
    throw new InternalServerErrorException(message);
  }

  /**
   * Throws a 501 Not Implemented exception
   * @param message - Error message describing what's not implemented
   */
  static notImplemented(message: string): never {
    throw new NotImplementedException(message);
  }

  /**
   * Throws a 502 Bad Gateway exception
   * @param message - Error message describing the bad gateway
   */
  static badGateway(message: string): never {
    throw new HttpException(message, HttpStatus.BAD_GATEWAY);
  }

  /**
   * Throws a 503 Service Unavailable exception
   * @param message - Error message describing service unavailability
   */
  static serviceUnavailable(message: string): never {
    throw new ServiceUnavailableException(message);
  }

  /**
   * Throws a 504 Gateway Timeout exception
   * @param message - Error message describing the gateway timeout
   */
  static gatewayTimeout(message: string): never {
    throw new HttpException(message, HttpStatus.GATEWAY_TIMEOUT);
  }

  /**
   * Throws a 505 HTTP Version Not Supported exception
   * @param message - Error message describing HTTP version issue
   */
  static httpVersionNotSupported(message: string): never {
    throw new HttpException(message, HttpStatus.HTTP_VERSION_NOT_SUPPORTED);
  }

  /**
   * Throws a 506 Variant Also Negotiates exception
   * @param message - Error message
   */
  static variantAlsoNegotiates(message: string): never {
    throw new HttpException(message, 506);
  }

  /**
   * Throws a 507 Insufficient Storage exception
   * @param message - Error message describing storage issue
   */
  static insufficientStorage(message: string): never {
    throw new HttpException(message, HttpStatus.INSUFFICIENT_STORAGE);
  }

  /**
   * Throws a 508 Loop Detected exception
   * @param message - Error message describing loop detection
   */
  static loopDetected(message: string): never {
    throw new HttpException(message, HttpStatus.LOOP_DETECTED);
  }

  /**
   * Throws a 510 Not Extended exception
   * @param message - Error message
   */
  static notExtended(message: string): never {
    throw new HttpException(message, 510);
  }

  /**
   * Throws a 511 Network Authentication Required exception
   * @param message - Error message describing network auth requirement
   */
  static networkAuthRequired(message: string): never {
    throw new HttpException(message, 511);
  }

  // ============================================================================
  // SPECIALIZED ERROR HELPERS
  // ============================================================================

  /**
   * Throws a database-related error
   * @param message - Error message
   */
  static databaseError(message: string): never {
    throw new InternalServerErrorException(message);
  }

  /**
   * Throws an external service error
   * @param service - Service name
   */
  static externalServiceError(service: string): never {
    throw new ServiceUnavailableException(service);
  }

  /**
   * Throws a rate limit error
   * @param message - Error message
   */
  static rateLimitExceeded(message: string): never {
    throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  /**
   * Throws a duplicate resource error
   * @param resource - Resource name
   * @param identifier - Optional identifier of the duplicate
   */
  static duplicate(resource: string, identifier?: string): never {
    const message = identifier
      ? `${resource} with identifier '${identifier}' already exists`
      : `${resource} already exists`;

    throw new ConflictException(message);
  }

  /**
   * Throws a resource not found error with context
   * @param resource - Resource name
   * @param identifier - Optional identifier that was not found
   */
  static resourceNotFound(resource: string, identifier?: string): never {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    throw new NotFoundException(message);
  }

  /**
   * Throws a type error new TypeError(message)
   * @param message - Error message
   */
  static typeMismatch(message: string): never {
    throw new TypeError(message);
  }

  /**
   * Throws a custom exception with any HTTP status code
   * @param status - HTTP status code
   * @param message - Error message
   */
  static customException(status: HttpStatus, message: string): never {
    throw new HttpException(message, status);
  }

  /**
   * Throws a custom error new Error(message)
   * @param message - Error message
   */
  static customError(message: string): never {
    throw new Error(message);
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
   */
  static throwIfNotFound<T>(
    value: T | null | undefined,
    message: string,
  ): asserts value is T {
    if (value === null || value === undefined) {
      this.notFound(message);
    }
  }

  /**
   * Throws forbidden if condition is true
   * @param condition - Condition to check
   * @param message - Error message
   */
  static throwIfForbidden(condition: boolean, message: string): void {
    if (condition) {
      this.forbidden(message);
    }
  }

  /**
   * Throws unauthorized if condition is true
   * @param condition - Condition to check
   * @param message - Error message
   */
  static throwIfUnauthorized(condition: boolean, message: string): void {
    if (condition) {
      this.unauthorized(message);
    }
  }

  // ============================================================================
  // ERROR WRAPPING AND TRANSFORMATION
  // ============================================================================

  /**
   * Wraps an unknown error into a structured error
   * @param error - The original error
   */
  static wrap(error: unknown): never {
    const cause = error instanceof Error ? error : new Error(String(error));
    throw new InternalServerErrorException(cause);
  }
}
