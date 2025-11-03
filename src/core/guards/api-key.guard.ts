import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const validApiKey = process.env.API_KEY;
    if (!validApiKey) {
      throw new ForbiddenException('API key not configured on server');
    }

    if (apiKey !== validApiKey) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
