import { Employee } from './src/employees/entities/employee.entity';
import { ProfileMetadata } from './src/employees/entities/profile-metadata.entity';
import { Notification } from './src/notifications/entities/notification.entity';
import { SkillCategory } from './src/skill-categories/entities/skill-category.entity';
import { Skill } from './src/skills/entities/skill.entity';
import { EmployeeSkill } from './src/employee-skills/entities/employee-skill.entity';

console.log("Entities loaded:");
console.log("Employee:", Employee ? Employee.name : "undefined");
console.log("ProfileMetadata:", ProfileMetadata ? ProfileMetadata.name : "undefined");
console.log("Notification:", Notification ? Notification.name : "undefined");
console.log("SkillCategory:", SkillCategory ? SkillCategory.name : "undefined");
console.log("Skill:", Skill ? Skill.name : "undefined");
console.log("EmployeeSkill:", EmployeeSkill ? EmployeeSkill.name : "undefined");
