import { Logger } from '@repo/utils-core';
import { TRPCError } from '@trpc/server';
import {
  TRPCErrorShape,
  TRPC_ERROR_CODE_KEY,
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
  // 4XX Client Errors
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.PAYMENT_REQUIRED]: 'BAD_REQUEST',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_SUPPORTED',
  [HttpStatus.NOT_ACCEPTABLE]: 'BAD_REQUEST',
  [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: 'UNAUTHORIZED',
  [HttpStatus.REQUEST_TIMEOUT]: 'TIMEOUT',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.GONE]: 'NOT_FOUND',
  [HttpStatus.LENGTH_REQUIRED]: 'BAD_REQUEST',
  [HttpStatus.PRECONDITION_FAILED]: 'PRECONDITION_FAILED',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.URI_TOO_LONG]: 'BAD_REQUEST',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'UNSUPPORTED_MEDIA_TYPE',
  [HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE]: 'BAD_REQUEST',
  [HttpStatus.EXPECTATION_FAILED]: 'BAD_REQUEST',
  [HttpStatus.I_AM_A_TEAPOT]: 'BAD_REQUEST',
  [HttpStatus.MISDIRECTED]: 'BAD_REQUEST',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_CONTENT',
  [HttpStatus.LOCKED]: 'CONFLICT',
  [HttpStatus.FAILED_DEPENDENCY]: 'CONFLICT',
  [HttpStatus.PRECONDITION_REQUIRED]: 'PRECONDITION_FAILED',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.UNRECOVERABLE_ERROR]: 'INTERNAL_SERVER_ERROR',

  // 5XX Server Errors
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [HttpStatus.NOT_IMPLEMENTED]: 'NOT_IMPLEMENTED',
  [HttpStatus.BAD_GATEWAY]: 'BAD_GATEWAY',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
  [HttpStatus.GATEWAY_TIMEOUT]: 'TIMEOUT',
  [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: 'BAD_GATEWAY',
  [HttpStatus.INSUFFICIENT_STORAGE]: 'INTERNAL_SERVER_ERROR',
  [HttpStatus.LOOP_DETECTED]: 'INTERNAL_SERVER_ERROR',
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
      path: path,
      stack: error.stack,
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

  // Prisma tenant extension throws Error with statusCode 403 when no tenant
  const statusCode = (cause as Error & { statusCode?: number }).statusCode;
  if (typeof statusCode === 'number' && statusCode === 403) {
    const result = handleGenericTRPCError(cause, 'FORBIDDEN', opts);
    result.errorShape.data.httpStatus = 403;
    return result;
  }

  return handleGenericTRPCError(cause, error.code, opts);
}

export function trpcErrorFormatter(opts: TRPCErrorOptions): TRPCErrorShapeType {
  const formattedError: FormattedError = getFormattedTRPCError(opts);
  const { input } = opts;
  const logArguments = {
    ...formattedError,
  };

  if (input && process.env.NODE_ENV === 'development') {
    Object.assign(logArguments, { input: input });
  }

  Logger.instance
    .withContext('TRPC Route')
    .critical(formattedError.errorShape.message, logArguments);

  return formattedError.errorShape;
}
