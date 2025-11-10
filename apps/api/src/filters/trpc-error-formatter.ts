import { Logger } from '@repo/utils-core';
import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { DateExtensions } from '@repo/utils-core/dist/extensions/date.extensions';

/**
 * tRPC error shape structure
 */
interface TRPCErrorShape {
  message: string; // Forbidden
  code: TRPC_ERROR_CODE_KEY; // -32003
  data: {
    code: string; // 'FORBIDDEN'
    httpStatus?: number; // 403
    path?: string; // router.procedure
    stack?: string;
    timestamp: string; //  11/10/2025, 1:07:11 PM
    type: 'query' | 'mutation' | 'subscription' | 'unknown';
    errorType: string; // HttpException | TRPCError | Error
    [key: string]: unknown;
  };
}

/**
 * Maps NestJS HttpStatus codes to tRPC error codes
 */
const statusMap: Record<number, TRPC_ERROR_CODE_KEY> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PRECONDITION_FAILED]: 'PRECONDITION_FAILED',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_SUPPORTED',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'UNSUPPORTED_MEDIA_TYPE',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.NOT_IMPLEMENTED]: 'NOT_IMPLEMENTED',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'BAD_REQUEST',
  [HttpStatus.REQUEST_TIMEOUT]: 'TIMEOUT',
  [HttpStatus.GATEWAY_TIMEOUT]: 'TIMEOUT',
  [HttpStatus.BAD_GATEWAY]: 'INTERNAL_SERVER_ERROR',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'INTERNAL_SERVER_ERROR',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

const trpcInternalErrorKey: TRPC_ERROR_CODE_KEY = 'INTERNAL_SERVER_ERROR';

const mapHttpStatusToTRPCCode = (status: HttpStatus): TRPC_ERROR_CODE_KEY => {
  return statusMap[status] ?? trpcInternalErrorKey;
};

/**
 * Determines the original error type and extracts relevant information
 */
function analyzeError(error: TRPCError): {
  errorType: string;
  originalError:
    | Error
    | TRPCError
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError;
  trpcCode: TRPC_ERROR_CODE_KEY;
  metadata: Record<string, unknown>;
} {
  const cause: Error | undefined = error.cause;

  if (cause instanceof HttpException) {
    const status: number = cause.getStatus();
    const response: string | object = cause.getResponse();

    return {
      errorType: cause.constructor.name,
      originalError: cause,
      trpcCode: mapHttpStatusToTRPCCode(status),
      metadata: {
        httpStatus: status,
        httpStatusText: HttpStatus[status],
        response: response,
        originalMessage: cause.message,
      },
    };
  }

  if (cause instanceof PrismaClientKnownRequestError) {
    return {
      errorType: cause.constructor.name,
      originalError: cause,
      trpcCode: trpcInternalErrorKey,
      metadata: {
        prismaCode: cause.code,
        prismaMessage: cause.message,
        meta: cause.meta,
        clientVersion: cause.clientVersion,
      },
    };
  }

  if (cause instanceof PrismaClientUnknownRequestError) {
    return {
      errorType: cause.constructor.name,
      originalError: cause,
      trpcCode: trpcInternalErrorKey,
      metadata: {
        prismaMessage: cause.message,
        clientVersion: cause.clientVersion,
      },
    };
  }

  if (cause instanceof PrismaClientValidationError) {
    return {
      errorType: cause.constructor.name,
      originalError: cause,
      trpcCode: 'BAD_REQUEST',
      metadata: {
        prismaMessage: cause.message,
      },
    };
  }

  if (
    cause instanceof PrismaClientRustPanicError ||
    cause instanceof PrismaClientInitializationError
  ) {
    return {
      errorType: cause.constructor.name,
      originalError: cause,
      trpcCode: trpcInternalErrorKey,
      metadata: {
        prismaMessage: cause.message,
        clientVersion: cause.clientVersion,
      },
    };
  }

  if (cause instanceof Error) {
    return {
      errorType: cause.constructor.name,
      originalError: cause,
      trpcCode: error.code,
      metadata: {
        originalMessage: cause.message,
        name: cause.name,
      },
    };
  }

  return {
    errorType: TRPCError.name,
    originalError: error,
    trpcCode: error.code,
    metadata: {},
  };
}

/**
 * Comprehensive tRPC error formatter that handles:
 * - TRPCErrors
 * - NestJS HttpExceptions (with proper code mapping)
 * - Prisma errors
 * - Standard JavaScript errors
 * - Unknown errors
 */
export function trpcErrorFormatter(opts: {
  error: TRPCError;
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined;
  input: unknown;
  ctx: unknown;
  shape: TRPCErrorShape;
}): TRPCErrorShape {
  const { error, type, path, shape, input } = opts;

  const analysis = analyzeError(error);

  const logContext = {
    message: error.message,
    errorType: analysis.errorType,
    trpcCode: analysis.trpcCode,
    procedureType: type,
    procedurePath: path,
    stack: error.stack,
    ...analysis.metadata,
    input: process.env.NODE_ENV === 'development' ? input : '[REDACTED]',
  };

  Logger.instance
    .withContext('TRPC Route')
    .critical('Error in TRPC Procedure', logContext);

  const baseData: TRPCErrorShape['data'] = {
    code: analysis.trpcCode,
    httpStatus: shape.data.httpStatus,
    path: path ?? shape.data.path,
    stack: shape.data.stack,
    timestamp: DateExtensions.FormatAsTimestamp(new Date()),
    type,
    errorType: analysis.errorType,
  };

  if (
    analysis.metadata.httpStatus &&
    typeof analysis.metadata.httpStatus === 'number'
  ) {
    baseData.httpStatus = analysis.metadata.httpStatus;
  }

  return {
    message: shape.message,
    code: shape.code,
    data: baseData,
  };
}
