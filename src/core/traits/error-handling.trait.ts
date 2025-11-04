import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseMessages } from '../constants/response-messages.enum';
import { HttpStatusCodes } from '../constants/http-status-codes.enum';
import { LoggingTrait } from './logging.trait';

export abstract class ErrorHandlingTrait extends LoggingTrait {
  protected handleError(error: any, context?: string): never {
    this.logError(`Error in ${context || this.constructor.name}`, error);

    if (error instanceof HttpException) {
      throw error;
    }

    // Database errors
    if (error.code === '23505') { // Unique constraint violation
      throw new HttpException(ResponseMessages.BAD_REQUEST, HttpStatusCodes.CONFLICT);
    }

    if (error.code === '23503') { // Foreign key constraint violation
      throw new HttpException(ResponseMessages.BAD_REQUEST, HttpStatusCodes.BAD_REQUEST);
    }

    // Generic database error
    if (error.code && error.code.startsWith('23')) {
      throw new HttpException(ResponseMessages.DATABASE_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Default error
    throw new HttpException(ResponseMessages.INTERNAL_SERVER_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  protected handleNotFound(resource: string, id?: string | number): never {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    this.logWarn(message);
    throw new HttpException(message, HttpStatusCodes.NOT_FOUND);
  }

  protected handleValidationError(errors: any[]): never {
    const messages = errors.map(error => {
      const constraints = error.constraints;
      return constraints ? Object.values(constraints).join(', ') : 'Validation error';
    });
    this.logWarn(`Validation errors: ${messages.join('; ')}`);
    throw new HttpException(`${ResponseMessages.VALIDATION_ERROR}: ${messages.join('; ')}`, HttpStatusCodes.BAD_REQUEST);
  }
}
