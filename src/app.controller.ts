import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ResponseMessages } from './core/constants/response-messages.enum';
import { HttpStatusCodes } from './core/constants/http-status-codes.enum';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: HttpStatusCodes.OK, description: ResponseMessages.HELLO_MESSAGE, type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
