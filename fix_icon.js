const fs = require('fs');
const p = 'C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\SkillDetailsScreen.tsx';
let data = fs.readFileSync(p, 'utf8');
data = data.replace('titleVariant="titleLarge" icon="paperclip"', 'titleVariant="titleLarge"');
fs.writeFileSync(p, data);
console.log('Fixed icon prop');
