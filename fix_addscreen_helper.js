const fs = require('fs');

let screen = fs.readFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', 'utf8');
// Fix TS errors for HelperText by casting errors.xyz.message as string
screen = screen.replace(/\{errors\.([a-zA-Z0-9_]+)\.message\}/g, '{errors.$1?.message as string}');
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\AddSkillScreen.tsx', screen);

console.log('Fixed message types in AddSkillScreen');
