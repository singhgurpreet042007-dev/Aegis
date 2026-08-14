import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditLogService } from '../../modules/audit/audit-log.service';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(@Optional() private readonly auditLogService?: AuditLogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || message;
        if (Array.isArray(res.message)) {
          details = { validation: res.message };
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    // Capture RBAC access denials (403) and Rate-limit blocks (429) in AuditLog
    if (status === HttpStatus.FORBIDDEN || status === HttpStatus.TOO_MANY_REQUESTS) {
      const action = status === HttpStatus.FORBIDDEN ? 'RBAC_ACCESS_DENIED' : 'RATE_LIMIT_BLOCKED';
      const user = (request as any).user;
      const actor = user?.id || 'anonymous';
      const actorEmail = user?.email || undefined;

      if (this.auditLogService) {
        this.auditLogService
          .log({
            actor,
            actorEmail,
            action,
            outcome: 'FAILURE',
            ipAddress: request.ip || request.socket.remoteAddress,
            userAgent: request.headers['user-agent'],
            metadata: {
              path: request.url,
              method: request.method,
              statusCode: status,
              message,
            },
          })
          .catch(() => {});
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code: HttpStatus[status] || 'INTERNAL_SERVER_ERROR',
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    });
  }
}
