const fs = require('fs');
const p = 'C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\EditSkillScreen.tsx';
if (!fs.existsSync(p)) {
  console.log("File not found:", p);
  process.exit(1);
}
let data = fs.readFileSync(p, 'utf8');
data = data.replace(/value={value}/g, "value={value || ''}");
fs.writeFileSync(p, data);
console.log('Fixed EditSkillScreen string nullability');
