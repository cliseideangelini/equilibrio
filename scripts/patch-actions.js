const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/actions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add username and dateOfBirth to createAppointment signature
content = content.replace(
    /export async function createAppointment\(formData: {[\s\S]*?}\) {/,
    `export async function createAppointment(formData: {
    name: string;
    email?: string;
    phone: string;
    username?: string;
    dateOfBirth?: string;
    password?: string;
    date: string;
    time: string;
    type: "ONLINE" | "PRESENCIAL";
}) {`
);

// 2. Destructure them
content = content.replace(
    /const { name, email, phone, password, date, time, type } = formData;/,
    `const { name, email, phone, username, dateOfBirth, password, date, time, type } = formData;`
);

// 3. Add to prisma.patient.create
content = content.replace(
    /patient = await prisma\.patient\.create\({[\s\S]*?data: {[\s\S]*?name,[\s\S]*?email: email \|\| null,[\s\S]*?phone,[\s\S]*?password: hashedPassword[\s\S]*?}[\s\S]*?}\);/,
    `patient = await prisma.patient.create({
            data: {
                name,
                email: email || null,
                phone,
                username: username || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                password: hashedPassword
            }
        });`
);

// 4. Add registerPatient action
const registerPatientFn = `
export async function registerPatient(formData: {
    name: string;
    email?: string;
    phone: string;
    username: string;
    dateOfBirth: string;
    password?: string;
}) {
    const { name, email, phone, username, dateOfBirth, password } = formData;
    
    const existingPhone = await prisma.patient.findFirst({ where: { phone, deletedAt: null } });
    if (existingPhone) return { success: false, error: "Este WhatsApp já está cadastrado." };
    
    const existingUsername = await prisma.patient.findFirst({ where: { username, deletedAt: null } });
    if (existingUsername) return { success: false, error: "Este Nome de Usuário já está em uso." };

    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const patient = await prisma.patient.create({
        data: {
            name,
            email: email || null,
            phone,
            username,
            dateOfBirth: new Date(dateOfBirth),
            password: hashedPassword
        }
    });

    // Auto-login setting cookie
    const cookieStore = await cookies();
    cookieStore.set("patient_id", patient.id, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });

    return { success: true, patient };
}
`;

content += '\n' + registerPatientFn;

fs.writeFileSync(filePath, content, 'utf8');
console.log('actions.ts patched successfully.');
