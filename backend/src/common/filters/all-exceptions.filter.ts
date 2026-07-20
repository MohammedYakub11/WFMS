import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    response.status(status).json({
      success: false,
      message,
      data: null,
      errors:
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        'message' in errorResponse
          ? (errorResponse as any).message
          : errorResponse || message,
    });
  }
}
