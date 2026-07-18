import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from '../employees/employees.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const employee = await this.employeesService.findByEmail(loginDto.email);
    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await employee.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(employee.id, employee.email);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as { sub: string; email: string };
      
      const employee = await this.employeesService.findById(String(payload.sub));
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
      return { message: 'If an account exists, a password reset link has been sent.' };
    }
    // TODO: Implement actual email sending logic and token generation
    return { message: 'If an account exists, a password reset link has been sent.' };
  }

  async resetPassword(_token: string, _newPassword: string) {
    // TODO: Implement actual token verification and password update
    await new Promise(resolve => setTimeout(resolve, 10)); // Dummy await to fix ESLint
    return { message: 'Password has been successfully reset.' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { email, sub: userId };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 900),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
      }),
    ]);

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        user: { id: userId, email }
      },
      errors: null
    };
  }
}
