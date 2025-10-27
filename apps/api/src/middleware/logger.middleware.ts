import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, headers } = req;
    const origin = headers.origin || headers.referer || 'Unknown';
    const userAgent = headers['user-agent'];

    this.logger.log(
      `${method} ${url} - Origin: ${origin} - User-Agent: ${userAgent || 'Unknown'}`,
    );

    // Log ALL headers for debugging
    // this.logger.debug('All Headers:', JSON.stringify(headers, null, 2));

    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(`Response: ${statusCode}`);
    });

    next();
  }
}
