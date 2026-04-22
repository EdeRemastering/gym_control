import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'node:crypto';
import { Request } from 'express';
import { StructuredLoggerService } from '../logger/structured-logger.service';

/**
 * RequestIdInterceptor
 * Adds unique request ID for tracking and logging
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest<
      Request & {
        requestId?: string;
        user?: { id?: string };
        gymId?: string;
      }
    >();
    const response = http.getResponse<{
      setHeader: (key: string, value: string) => void;
    }>();
    const requestId =
      (request.headers['x-request-id'] as string) ?? randomUUID();
    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          {
            event: 'request_completed',
            requestId,
            method: request.method,
            path: request.url,
            statusCode: (response as { statusCode?: number }).statusCode,
            userId: request.user?.id ?? null,
            gymId: request.gymId ?? null,
            durationMs: Date.now() - startedAt,
          },
          RequestIdInterceptor.name,
        );
      }),
    );
  }
}
