const fs = require('fs');
const path = require('path');

function replaceFile(filePath, replacements) {
    const fullPath = path.resolve(__dirname, 'frontend/RNTest', filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(fullPath, content);
}

replaceFile('src/components/skills/SkillCard.tsx', [
    { search: /\{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, fontSize: 12 \}/g, replace: "styles.chipText" },
    { search: /export const SkillCard = memo\(SkillCardComponent\);/, replace: "  chipText: {\n    color: theme.colors.textSecondary,\n    fontFamily: theme.typography.fontFamily.medium,\n    fontSize: 12,\n  },\n});\n\nexport const SkillCard = memo(SkillCardComponent);" }
]);

replaceFile('src/components/skills/SkillSkeleton.tsx', [
    { search: /\{ opacity, width: 60 \}/g, replace: "[{ opacity }, styles.smallChip]" },
    { search: /export const SkillSkeleton = \(\) => \{/, replace: "const smallChipStyle = { width: 60 };\n\nexport const SkillSkeleton = () => {" },
    { search: /styles\.smallChip/, replace: "smallChipStyle" }
]);

replaceFile('src/screens/skills/EditEmployeeSkillScreen.tsx', [
    { search: /style=\{\{ flex: 1 \}\}/g, replace: 'style={styles.loader}' },
    { search: /const styles = StyleSheet\.create\(\{/, replace: 'const styles = StyleSheet.create({\n  loader: { flex: 1 },' }
]);

replaceFile('src/screens/skills/EmployeeSkillDetailsScreen.tsx', [
    { search: /style=\{\{ flex: 1 \}\}/g, replace: 'style={styles.loader}' },
    { search: /const styles = StyleSheet\.create\(\{/, replace: 'const styles = StyleSheet.create({\n  loader: { flex: 1 },' }
]);

replaceFile('src/screens/skills/MySkillsScreen.tsx', [
    { search: /style=\{\{ marginVertical: 16 \}\}/g, replace: 'style={styles.loader}' },
    { search: /const styles = StyleSheet\.create\(\{/, replace: 'const styles = StyleSheet.create({\n  loader: { marginVertical: 16 },' }
]);
