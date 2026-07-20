import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequestWithPermissions {
  user?: { permissions?: string[] };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<RequestWithPermissions>();
    const userPermissions: string[] = user?.permissions || [];

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
