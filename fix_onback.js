const fs = require('fs');

const files = [
  'C:/WFMS/frontend/RNTest/src/screens/skills/EmployeeSkillDetailsScreen.tsx',
  'C:/WFMS/frontend/RNTest/src/screens/skills/AddEmployeeSkillScreen.tsx',
  'C:/WFMS/frontend/RNTest/src/screens/skills/EditEmployeeSkillScreen.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/ onBack=\{[^}]+\}/g, '');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
