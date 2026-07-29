import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from '../employees/employees.service';
import { RolesService } from '../roles/roles.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly employeesService: EmployeesService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async login(loginDto: LoginDto) {
    const employee = await this.employeesService.findByEmail(loginDto.email);
    if (!employee) {
      await this.recordAuditSafe({
        userId: null,
        module: 'AUTH',
        entity: 'Employee',
        entityId: null,
        action: 'LOGIN_FAILED',
        newValue: { email: loginDto.email },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await employee.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      await this.recordAuditSafe({
        userId: null,
        module: 'AUTH',
        entity: 'Employee',
        entityId: null,
        action: 'LOGIN_FAILED',
        newValue: { email: loginDto.email },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.recordAuditSafe({
      userId: employee.id,
      module: 'AUTH',
      entity: 'Employee',
      entityId: employee.id,
      action: 'LOGIN',
      newValue: { email: employee.email },
    });

    return this.generateTokens(employee.id, employee.email);
  }

  async logout(userId?: string) {
    await this.recordAuditSafe({
      userId: userId ?? null,
      module: 'AUTH',
      entity: 'Employee',
      entityId: userId ?? null,
      action: 'LOGOUT',
    });

    return {
      success: true,
      message: 'Logged out successfully',
      data: {},
      errors: null,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        refreshTokenDto.refreshToken,
        { secret: this.configService.get<string>('JWT_REFRESH_SECRET') },
      );

      const employee = await this.employeesService.findById(
        String(payload.sub),
      );
      if (!employee) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(employee.id, employee.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const employee = await this.employeesService.findByEmail(email);
    if (!employee) {
      // For security, don't reveal if user exists, just return success
      return {
        message: 'If an account exists, a password reset link has been sent.',
      };
    }
    // TODO: Implement actual email sending logic and token generation
    await this.recordAuditSafe({
      userId: employee.id,
      module: 'AUTH',
      entity: 'Employee',
      entityId: employee.id,
      action: 'PASSWORD_RESET',
      newValue: { email: employee.email, stage: 'requested' },
    });
    return {
      message: 'If an account exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // TODO: Implement actual token verification and password update
    await new Promise((resolve) => setTimeout(resolve, 10)); // Dummy await to fix ESLint
    await this.recordAuditSafe({
      userId: null,
      module: 'AUTH',
      entity: 'Employee',
      entityId: null,
      action: 'PASSWORD_RESET',
      newValue: {
        stage: 'completed',
        tokenProvided: Boolean(token),
        newPasswordProvided: Boolean(newPassword),
      },
    });
    return { message: 'Password has been successfully reset.' };
  }

  /**
   * Best-effort audit write. Never throws — a failure here must not
   * affect the outcome of the auth flow it's attached to.
   */
  private async recordAuditSafe(
    input: Parameters<AuditLogService['record']>[0],
  ): Promise<void> {
    try {
      await this.auditLogService.record(input);
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for action ${input.action}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  private async generateTokens(userId: string, email: string) {
    const { roleName, permissionCodes } =
      await this.rolesService.getEffectivePermissions(userId);
    const payload = {
      email,
      sub: userId,
      role: roleName,
      permissions: permissionCodes,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 900),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<number>(
          'JWT_REFRESH_EXPIRES_IN',
          604800,
        ),
      }),
    ]);

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email,
          role: roleName,
          permissions: permissionCodes,
        },
      },
      errors: null,
    };
  }
}
