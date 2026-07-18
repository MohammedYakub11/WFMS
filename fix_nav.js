const fs = require('fs');
const p = 'C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\SkillDetailsScreen.tsx';
let data = fs.readFileSync(p, 'utf8');
data = data.replace("onPress={() => console.log('Edit skill', skillId)}", "onPress={() => navigation.navigate('EditSkill', { id: skillId })}");
fs.writeFileSync(p, data);
console.log('Fixed Edit button navigation');
