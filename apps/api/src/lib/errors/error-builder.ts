import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Centralized error builder to simplify exception throwing across the application.
 *
 * @example
 * return ErrorBuilder.notFound('Dataset not found');
 * return ErrorBuilder.badRequest('Invalid input data');
 * return ErrorBuilder.unauthorized('Invalid credentials');
 */
export class ErrorBuilder {
  /**
   * Throws a 404 Not Found exception
   * @param message - Error message describing what was not found
   */
  static notFound(message: string): never {
    throw new NotFoundException(message);
  }

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
   * Throws a 403 Forbidden exception
   * @param message - Error message describing why access is forbidden
   */
  static forbidden(message: string): never {
    throw new ForbiddenException(message);
  }

  /**
   * Throws a 409 Conflict exception
   * @param message - Error message describing the conflict
   */
  static conflict(message: string): never {
    throw new ConflictException(message);
  }

  /**
   * Throws a 500 Internal Server Error exception
   * @param message - Error message describing the internal error
   */
  static internalError(message: string): never {
    throw new InternalServerErrorException(message);
  }
}
