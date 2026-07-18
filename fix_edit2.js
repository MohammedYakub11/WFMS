const fs = require('fs');
const p = 'C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\EditSkillScreen.tsx';
let data = fs.readFileSync(p, 'utf8');

// Fix Switch value
data = data.replace('<Switch value={value || \'\'} onValueChange={onChange} />', '<Switch value={Boolean(value)} onValueChange={onChange} />');

// Fix ProficiencyRating value
data = data.replace('<ProficiencyRating value={value || \'\'} onChange={onChange} />', '<ProficiencyRating value={Number(value)} onChange={onChange} />');

fs.writeFileSync(p, data);
console.log('Fixed types');
