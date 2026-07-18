const fs = require('fs');

let screen = fs.readFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', 'utf8');
screen = screen.replace(/error=\{errors\.proficiencyRating\?\.message\}/g, 'error={errors.proficiencyRating?.message as string}');
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', screen);

console.log('Fixed proficiencyRating error type in AddSkillScreen');
