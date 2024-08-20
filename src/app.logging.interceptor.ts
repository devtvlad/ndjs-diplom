import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl } = request;

    this.logger.log(`${method} ${originalUrl}`);

    return next.handle().pipe(
      tap((data) => {
        this.logger.log({
          status: 'success',
          data,
        });
      }),
      catchError((error) => {
        this.logger.error({
          status: 'fail',
          error,
        });
        throw error;
      }),
    );
  }
}
