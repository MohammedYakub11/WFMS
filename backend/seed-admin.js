"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const employees_service_1 = require("./src/employees/employees.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const employeesService = app.get(employees_service_1.EmployeesService);
    const adminEmail = 'admin@wfms.com';
    const existingAdmin = await employeesService.findByEmail(adminEmail);
    if (existingAdmin) {
        console.log('Admin user already exists!');
        console.log('Email:', existingAdmin.email);
        console.log('Password: The password you set previously (e.g. Admin@123)');
    }
    else {
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
bootstrap().catch(err => {
    console.error('Error seeding admin user:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-admin.js.map