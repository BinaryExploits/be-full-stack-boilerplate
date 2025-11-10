import { Logger, DateExtensions } from '@repo/utils-core';
import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODE_KEY, TRPCErrorShape } from '@trpc/server/rpc';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

type TRPCErrorShapeType = TRPCErrorShape<{
  trpcCode: string; // 'FORBIDDEN'
  httpStatus?: number; // 403
  path?: string; // router.procedure
  timestamp: string; // 11/10/2025, 1:07:11 PM
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  errorType: string; // HttpException | TRPCError | Error
  stack?: string;
}>;

type FormattedError = {
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
};

const httpStatusToTRPCErrorMap: Partial<
  Record<HttpStatus, TRPC_ERROR_CODE_KEY>
> = {
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

const DEFAULT_TRPC_ERROR: TRPC_ERROR_CODE_KEY = 'INTERNAL_SERVER_ERROR';

const mapHttpStatusToTRPCError = (status: HttpStatus): TRPC_ERROR_CODE_KEY =>
  httpStatusToTRPCErrorMap[status] ?? DEFAULT_TRPC_ERROR;

function buildFormattedError<T extends FormattedError['originalError']>(
  cause: T,
  trpcCode: TRPC_ERROR_CODE_KEY,
  metadata: Record<string, unknown> = {},
): FormattedError {
  return {
    errorType: cause.constructor.name,
    originalError: cause,
    trpcCode,
    metadata,
  };
}

function handleHttpError(cause: HttpException): FormattedError {
  const status: number = cause.getStatus();
  const response: string | object = cause.getResponse();

  return buildFormattedError(cause, mapHttpStatusToTRPCError(status), {
    httpStatus: status,
    httpStatusText: HttpStatus[status],
    response,
    originalMessage: cause.message,
  });
}

function handlePrismaError(
  cause:
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError,
): FormattedError {
  const metadata: Record<string, unknown> = {
    prismaMessage: cause.message,
  };

  let trpcCode: TRPC_ERROR_CODE_KEY = DEFAULT_TRPC_ERROR;

  if (cause instanceof PrismaClientKnownRequestError) {
    Object.assign(metadata, {
      prismaCode: cause.code,
      meta: cause.meta,
      clientVersion: cause.clientVersion,
    });
  } else if (cause instanceof PrismaClientValidationError) {
    trpcCode = 'BAD_REQUEST';
  } else if (
    cause instanceof PrismaClientUnknownRequestError ||
    cause instanceof PrismaClientRustPanicError ||
    cause instanceof PrismaClientInitializationError
  ) {
    Object.assign(metadata, {
      clientVersion: cause.clientVersion,
    });
  }

  return buildFormattedError(cause, trpcCode, metadata);
}

function handleGenericError(
  cause: Error,
  trpcCode: TRPC_ERROR_CODE_KEY,
): FormattedError {
  return buildFormattedError(cause, trpcCode, {
    originalMessage: cause.message,
    name: cause.name,
  });
}

function formatErrorForTRPC(error: TRPCError): FormattedError {
  const cause: Error | undefined = error.cause;

  if (!cause) {
    return handleGenericError(error, error.code);
  }

  if (cause instanceof HttpException) {
    return handleHttpError(cause);
  }

  if (
    cause instanceof PrismaClientKnownRequestError ||
    cause instanceof PrismaClientUnknownRequestError ||
    cause instanceof PrismaClientValidationError ||
    cause instanceof PrismaClientRustPanicError ||
    cause instanceof PrismaClientInitializationError
  ) {
    return handlePrismaError(cause);
  }

  return handleGenericError(cause, error.code);
}

export function trpcErrorFormatter(opts: {
  error: TRPCError;
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined;
  input: unknown;
  ctx: unknown;
  shape: TRPCErrorShapeType;
}): TRPCErrorShapeType {
  const { error, type, path, shape, input } = opts;
  const formattedError: FormattedError = formatErrorForTRPC(error);
  const logContext = {
    message: error.message,
    errorType: formattedError.errorType,
    trpcCode: formattedError.trpcCode,
    procedureType: type,
    procedurePath: path,
    ...formattedError.metadata,
    input: process.env.NODE_ENV === 'development' ? input : '[REDACTED]',
    stack: error.stack,
  };

  Logger.instance
    .withContext('TRPC Route')
    .critical('Error in TRPC Procedure', logContext);

  const baseData: TRPCErrorShapeType['data'] = {
    trpcCode: formattedError.trpcCode,
    httpStatus: shape.data.httpStatus,
    path: path ?? shape.data.path,
    stack: shape.data.stack,
    timestamp: DateExtensions.FormatAsTimestamp(new Date()),
    type,
    errorType: formattedError.errorType,
  };

  if (
    formattedError.metadata.httpStatus &&
    typeof formattedError.metadata.httpStatus === 'number'
  ) {
    baseData.httpStatus = formattedError.metadata.httpStatus;
  }

  return {
    message: shape.message,
    code: shape.code,
    data: baseData,
  };
}
