const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/actions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the OLD registerPatient (the simple one with just name/phone/password/email)
const oldRegisterPatient = /export async function registerPatient\(formData: \{ name: string, phone: string, password: string, email\?: string \}\) \{[\s\S]*?revalidatePath\("\/area-clinica\/pacientes"\);\s*return \{ success: true, patientId: \(patient as any\)\.id \};\s*\}/;

if (oldRegisterPatient.test(content)) {
    content = content.replace(oldRegisterPatient, '');
    console.log('Old registerPatient removed successfully.');
} else {
    console.log('Pattern not found! Check manually.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done.');
