import { Logger, DateExtensions } from '@repo/utils-core';
import { TRPCError } from '@trpc/server';
import {
  TRPC_ERROR_CODE_KEY,
  TRPCErrorShape,
  TRPC_ERROR_CODES_BY_KEY,
} from '@trpc/server/rpc';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { AppContextType } from '../app.context';

type TRPCErrorShapeType = TRPCErrorShape<{
  trpcCodeKey: TRPC_ERROR_CODE_KEY; // 'FORBIDDEN'
  errorType: string; // HttpException | TRPCError | Error
  timestamp: string; // 11/10/2025, 1:07:11 PM
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  httpStatus?: number; // 403
  path?: string; // router.procedure
}>;

type ShapedError = {
  shape: TRPCErrorShapeType;
  originalError:
    | Error
    | TRPCError
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError;
  metadata: Record<string, unknown>;
  stack?: string;
};

type TRPCErrorOptions = {
  error: TRPCError;
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined;
  input: unknown;
  ctx: AppContextType;
  shape: TRPCErrorShapeType;
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

const getTRPCErrorFromHttpStatus = (status: HttpStatus): TRPC_ERROR_CODE_KEY =>
  httpStatusToTRPCErrorMap[status] ?? DEFAULT_TRPC_ERROR;

function buildShapedError<T extends ShapedError['originalError']>(
  cause: T,
  trpcCodeKey: TRPC_ERROR_CODE_KEY,
  opts: TRPCErrorOptions,
  metadata: Record<string, unknown> = {},
): ShapedError {
  const { error, type, path, shape } = opts;
  const errorShape: TRPCErrorShapeType = {
    code: TRPC_ERROR_CODES_BY_KEY[trpcCodeKey],
    message: shape.message,
    data: {
      trpcCodeKey: trpcCodeKey,
      httpStatus: shape.data.httpStatus,
      path: path ?? shape.data.path,
      timestamp: DateExtensions.FormatAsTimestamp(new Date()),
      type: type,
      errorType: cause.constructor.name,
    },
  };

  return {
    shape: errorShape,
    originalError: cause,
    stack: error.stack,
    metadata,
  };
}

function handleHttpError(
  cause: HttpException,
  opts: TRPCErrorOptions,
): ShapedError {
  const status: number = cause.getStatus();
  const response: string | object = cause.getResponse();

  const shapedError: ShapedError = buildShapedError(
    cause,
    getTRPCErrorFromHttpStatus(status),
    opts,
    {
      httpStatus: status,
      httpStatusText: HttpStatus[status],
      response: response,
      originalMessage: cause.message,
    },
  );

  shapedError.shape.data.httpStatus = status;
  return shapedError;
}

function handlePrismaError(
  cause:
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError,
  opts: TRPCErrorOptions,
): ShapedError {
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
    trpcCode = getTRPCErrorFromHttpStatus(HttpStatus.BAD_REQUEST);
  } else if (
    cause instanceof PrismaClientUnknownRequestError ||
    cause instanceof PrismaClientRustPanicError ||
    cause instanceof PrismaClientInitializationError
  ) {
    Object.assign(metadata, {
      clientVersion: cause.clientVersion,
    });
  }

  return buildShapedError(cause, trpcCode, opts, metadata);
}

function handleGenericTRPCError(
  cause: Error,
  trpcCodeKey: TRPC_ERROR_CODE_KEY,
  opts: TRPCErrorOptions,
): ShapedError {
  return buildShapedError(cause, trpcCodeKey, opts, {
    name: cause.name,
    originalMessage: cause.message,
  });
}

function shapeErrorForTRPC(opts: TRPCErrorOptions): ShapedError {
  const { error } = opts;
  const cause: Error | undefined = error.cause;

  if (!cause) {
    return handleGenericTRPCError(error, error.code, opts);
  }

  if (cause instanceof HttpException) {
    return handleHttpError(cause, opts);
  }

  if (
    cause instanceof PrismaClientKnownRequestError ||
    cause instanceof PrismaClientUnknownRequestError ||
    cause instanceof PrismaClientValidationError ||
    cause instanceof PrismaClientRustPanicError ||
    cause instanceof PrismaClientInitializationError
  ) {
    return handlePrismaError(cause, opts);
  }

  return handleGenericTRPCError(cause, error.code, opts);
}

export function trpcErrorFormatter(opts: TRPCErrorOptions): TRPCErrorShapeType {
  const { input } = opts;
  const shapedError: ShapedError = shapeErrorForTRPC(opts);
  const logArguments = {
    input: process.env.NODE_ENV === 'development' ? input : '[REDACTED]',
    ...shapedError,
  };

  Logger.instance
    .withContext('TRPC Route')
    .critical(shapedError.shape.message, logArguments);

  return shapedError.shape;
}
