import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Employee } from './entities/employee.entity';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const data = await this.employeesService.findById(id);
    return { success: true, message: 'Profile fetched successfully', data, errors: null };
  }

  @Put(':id')
  async updateProfile(@Param('id') id: string, @Body() updateData: Partial<Employee>) {
    const data = await this.employeesService.updateProfile(id, updateData);
    return { success: true, message: 'Profile updated successfully', data, errors: null };
  }
}
