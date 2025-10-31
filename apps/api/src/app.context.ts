import { Injectable } from '@nestjs/common';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';
import { IncomingMessage, ServerResponse } from 'node:http';

export interface AppContextType extends Record<string, unknown> {
  req: IncomingMessage;
  res: ServerResponse;
}

@Injectable()
export class AppContext implements TRPCContext {
  create(opts: ContextOptions): AppContextType {
    return {
      req: opts.req as IncomingMessage,
      res: opts.res as ServerResponse,
    };
  }
}
