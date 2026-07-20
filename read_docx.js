const fs = require('fs');
const unzipper = require('unzipper');

async function extractDocxText(filePath) {
    const directory = await unzipper.Open.file(filePath);
    const documentXml = directory.files.find(d => d.path === 'word/document.xml');
    
    if (documentXml) {
        const content = await documentXml.buffer();
        let text = content.toString('utf8');
        // Simple regex to extract text between XML tags
        text = text.replace(/<w:p[^>]*>/g, '\n');
        text = text.replace(/<[^>]+>/g, '');
        console.log(text.substring(0, 15000)); // Print first 15000 chars to avoid overwhelming output
    }
}

extractDocxText('C:/WFMS/Workforce Management System PRD.docx').catch(console.error);
