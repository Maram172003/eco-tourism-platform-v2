import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Public route: try to authenticate if a token is present (optional auth)
      // but don't fail if no token or invalid token
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers?.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const result = super.canActivate(context);
        if (result instanceof Promise) {
          return result.catch(() => true);
        }
        return true;
      }
      return true;
    }

    return super.canActivate(context);
  }
}
