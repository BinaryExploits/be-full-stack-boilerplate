import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@repo/utils-core';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, headers } = req;
    const origin = headers?.origin || headers?.referer || 'Unknown';
    const userAgent = headers?.['user-agent'] || 'Unknown';

    const message = `${method || 'UNKNOWN'} ${url || '/'} - Origin: ${origin} - User-Agent: ${userAgent}`;
    Logger.instance.withContext('API Middleware').info(message);

    res.on('finish', () => {
      const { statusCode } = res;
      Logger.instance
        .withContext('API Middleware')
        .info(`Response: ${statusCode || 'UNKNOWN'}`);
    });

    next();
  }
}
