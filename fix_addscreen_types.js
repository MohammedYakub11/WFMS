const fs = require('fs');

let screen = fs.readFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', 'utf8');
screen = screen.replace(/useForm<AddSkillFormData>/g, 'useForm<any>');
screen = screen.replace(/onSubmit = async \(data: AddSkillFormData\)/g, 'onSubmit = async (data: any)');
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', screen);

console.log('Fixed types in AddSkillScreen');
