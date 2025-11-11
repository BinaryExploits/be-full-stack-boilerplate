import { Logger } from '@repo/utils-core';
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

type TRPCErrorShapeType = TRPCErrorShape<{
  code: TRPC_ERROR_CODE_KEY; // NOT_FOUND
  httpStatus: number; // 404
  path?: string; // router.procedure
  stack?: string; // at line(93, 3)
}>;

type FormattedError = {
  errorShape: TRPCErrorShapeType;
  originalError:
    | Error
    | TRPCError
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError;
  metadata: Record<string, unknown>;
};

type TRPCErrorOptions = {
  error: TRPCError;
  path: string | undefined;
  input: unknown;
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

function buildFormattedError<T extends FormattedError['originalError']>(
  cause: T,
  trpcCodeKey: TRPC_ERROR_CODE_KEY,
  opts: TRPCErrorOptions,
  metadata: Record<string, unknown> = {},
): FormattedError {
  const { error, path, shape } = opts;
  const errorShape: TRPCErrorShapeType = {
    code: TRPC_ERROR_CODES_BY_KEY[trpcCodeKey],
    message: shape.message,
    data: {
      code: trpcCodeKey,
      httpStatus: shape.data.httpStatus,
      path: path ?? shape.data.path,
      stack: shape.data.stack ?? error.stack,
    },
  };

  return {
    errorShape: errorShape,
    originalError: cause,
    metadata,
  };
}

function handleHttpError(
  cause: HttpException,
  opts: TRPCErrorOptions,
): FormattedError {
  const status: number = cause.getStatus();
  const response: string | object = cause.getResponse();

  const formattedError: FormattedError = buildFormattedError(
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

  formattedError.errorShape.data.httpStatus = status;
  return formattedError;
}

function handlePrismaError(
  cause:
    | PrismaClientKnownRequestError
    | PrismaClientUnknownRequestError
    | PrismaClientValidationError
    | PrismaClientRustPanicError
    | PrismaClientInitializationError,
  opts: TRPCErrorOptions,
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

  return buildFormattedError(cause, trpcCode, opts, metadata);
}

function handleGenericTRPCError(
  cause: Error,
  trpcCodeKey: TRPC_ERROR_CODE_KEY,
  opts: TRPCErrorOptions,
): FormattedError {
  return buildFormattedError(cause, trpcCodeKey, opts, {
    name: cause.name,
    originalMessage: cause.message,
  });
}

function getFormattedTRPCError(opts: TRPCErrorOptions): FormattedError {
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
  const formattedError: FormattedError = getFormattedTRPCError(opts);
  const { input } = opts;
  const logArguments = {
    input: process.env.NODE_ENV === 'development' ? input : '[REDACTED]',
    ...formattedError,
  };

  Logger.instance
    .withContext('TRPC Route')
    .critical(formattedError.errorShape.message, logArguments);

  return formattedError.errorShape;
}
