import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeesService } from '../../employees/employees.service';
import { Employee } from '../../employees/entities/employee.entity';

export interface JwtPayload {
  email: string;
  sub: string;
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
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'super-secret-jwt-key', // Ensure it has a fallback just in case
    });
  }

  async validate(payload: JwtPayload): Promise<Employee> {
    const employee = await this.employeesService.findById(payload.sub);

    if (!employee) {
      throw new UnauthorizedException();
    }

    return employee;
  }
}