const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'actions.ts');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

// Remove import (it was at line 5, but let's find it)
const importIndex = lines.findIndex(line => line.includes('createGoogleCalendarEvent') && line.includes('import'));
if (importIndex !== -1) {
    lines.splice(importIndex, 1);
}

// Remove logic in createAppointment (lines 179-195 approx)
const startSearch = lines.findIndex(line => line.includes('// Google Calendar'));
if (startSearch !== -1) {
    const endSearch = lines.findIndex((line, idx) => idx > startSearch && line.includes('if (type !== "ONLINE") meetLink = null;'));
    if (endSearch !== -1) {
        const count = endSearch - startSearch + 1;
        lines.splice(startSearch, count, '    const meetLink = type === "ONLINE" ? "https://meet.google.com/wnx-geqg-wgs" : null;');
    }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Google Calendar integration removed successfully');
