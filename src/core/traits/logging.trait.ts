import { Logger } from '@nestjs/common';

export abstract class LoggingTrait {
  protected readonly logger = new Logger(this.constructor.name);

  protected logInfo(message: string, context?: any): void {
    this.logger.log(message, context);
  }

  protected logError(message: string, error?: any): void {
    this.logger.error(message, error);
  }

  protected logWarn(message: string, context?: any): void {
    this.logger.warn(message, context);
  }

  protected logDebug(message: string, context?: any): void {
    this.logger.debug(message, context);
  }
}
