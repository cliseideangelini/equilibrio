const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'actions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Remove Google Calendar import
content = content.replace(/import { createGoogleCalendarEvent } from "@\/lib\/google-calendar";\r?\n/, '');

// Remove Google Calendar logic in createAppointment
const googleBlockRegex = /\/\/ Google Calendar.*?\n\s+let meetLink: string \| null = "https:\/\/meet\.google\.com\/wnx-geqg-wgs";[\s\S]*?if \(type !== "ONLINE"\) meetLink = null;/;
content = content.replace(googleBlockRegex, 'const meetLink = type === "ONLINE" ? "https://meet.google.com/wnx-geqg-wgs" : null;');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Google Calendar integration removed from actions.ts');
