import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeesService } from '../../employees/employees.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

// The shape attached to req.user for every guarded request — deliberately lean,
// not the raw Employee entity, so guards never touch DB-loaded fields by accident.
export interface AuthenticatedUser {
  id: string;
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly employeesService: EmployeesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'super-secret-jwt-key', // Ensure it has a fallback just in case
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // findById excludes soft-deleted employees by default (Employee has @DeleteDateColumn).
    const employee = await this.employeesService.findById(payload.sub);

    if (!employee) {
      throw new UnauthorizedException();
    }

    return {
      id: employee.id,
      sub: employee.id,
      email: employee.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}
