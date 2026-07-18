const fs = require('fs');

let card = fs.readFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\skills\\SkillCard.tsx', 'utf8');
card = card.replace(/employeeSkill\.skill\.name/g, 'employeeSkill.skill?.skillName');
card = card.replace(/employeeSkill\.skill\.category\.categoryName/g, 'employeeSkill.skill?.category?.categoryName');
card = card.replace(/employeeSkill\.proficiencyLevel/g, 'employeeSkill.proficiencyRating');
card = card.replace(/new Date\(employeeSkill\.lastUsedDate\)\.toLocaleDateString\(\)/g, 'employeeSkill.lastUsedDate ? new Date(employeeSkill.lastUsedDate).toLocaleDateString() : "N/A"');
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\skills\\SkillCard.tsx', card);

let screen = fs.readFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\MySkillsScreen.tsx', 'utf8');
screen = screen.replace(/\(selectedCategoryId \|\| selectedProficiency\) && \{ backgroundColor: theme\.colors\.primaryContainer \}/g, '(selectedCategoryId || selectedProficiency) ? { backgroundColor: theme.colors.primaryContainer } : undefined');
screen = screen.replace(/onEdit=\{\(skill\) =>/g, 'onEdit={(skill: any) =>');
screen = screen.replace(/onDelete=\{\(skill\) =>/g, 'onDelete={(skill: any) =>');
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\screens\\skills\\MySkillsScreen.tsx', screen);

console.log('Fixed types in SkillCard and MySkillsScreen');
