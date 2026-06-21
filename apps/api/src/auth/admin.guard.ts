import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Protects write endpoints. Requires `Authorization: Bearer <ADMIN_TOKEN>`.
 * Single-author blog: one shared admin token, configured via env.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expected = this.config.get<string>('ADMIN_TOKEN');
    if (!expected) {
      throw new UnauthorizedException('Admin token is not configured');
    }
    const header = request.headers.authorization;
    if (header !== `Bearer ${expected}`) {
      throw new UnauthorizedException('Invalid or missing admin token');
    }
    return true;
  }
}
