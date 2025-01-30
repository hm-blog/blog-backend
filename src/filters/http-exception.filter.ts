import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ServerException } from '../exceptions/server.exception';

@Catch(ServerException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: ServerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { status, message } = exception.errorCode;

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
