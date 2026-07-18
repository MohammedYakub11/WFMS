import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findByEmail(email: string): Promise<Employee | null> {
    // We need to add select: ['password'] because it's excluded by default in entity
    return this.employeeRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        first_name: true,
        last_name: true,
        employee_code: true,
        designation: true,
        department: true,
        status: true,
      },
    });
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  // Helper method for initial setup or testing
  async create(employeeData: Partial<Employee>): Promise<Employee> {
    const employee = this.employeeRepository.create(employeeData);
    return this.employeeRepository.save(employee);
  }

  async updateProfile(id: string, updateData: Partial<Employee>) {
    // In a real app, we would validate updateData via DTOs and handle profile metadata
    // For now, we update the base Employee fields
    await this.employeeRepository.update(id, updateData);
    return this.findById(id);
  }
}
