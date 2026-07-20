import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EmployeesService } from '../employees/employees.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const employeesService = app.get(EmployeesService);

  const adminEmail = 'admin@wfms.com';
  const existingAdmin = await employeesService.findByEmail(adminEmail);

  if (existingAdmin) {
    console.log('Admin user already exists!');
    console.log('Email:', existingAdmin.email);
    console.log('Password: The password you set previously (e.g. Admin@123)');
  } else {
    const newAdmin = await employeesService.create({
      employee_code: 'ADM001',
      first_name: 'System',
      last_name: 'Admin',
      email: adminEmail,
      password: 'Password@123',
      designation: 'Administrator',
      department: 'IT',
      experience: 10,
      status: 'active',
    });
    console.log('Admin user successfully created!');
    console.log('Email:', newAdmin.email);
    console.log('Password: Password@123');
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error seeding admin user:', err);
  process.exit(1);
});
