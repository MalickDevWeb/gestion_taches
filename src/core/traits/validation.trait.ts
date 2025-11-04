import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ResponseMessages } from '../constants/response-messages.enum';

export abstract class ValidationTrait {
  async validate(): Promise<void> {
    const errors = await validate(this);
    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        const constraints = error.constraints;
        return constraints ? Object.values(constraints).join(', ') : 'Validation error';
      });
      throw new BadRequestException(`${ResponseMessages.VALIDATION_ERROR}: ${errorMessages.join('; ')}`);
    }
  }
}
