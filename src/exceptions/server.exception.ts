import ErrorCode from './error-code';
import { HttpStatus } from '@nestjs/common';

export class ServerException extends Error {
  readonly errorCode: ErrorCode;

  constructor(status: HttpStatus, message: string) {
    super(message);

    this.errorCode = new ErrorCode(status, message);
  }
}

export class ServiceException extends ServerException {
  constructor(errorCode: ErrorCode, message?: string) {
    const status = errorCode.status;
    if (!message) {
      message = errorCode.message;
    }
    super(status, message);
  }
}
