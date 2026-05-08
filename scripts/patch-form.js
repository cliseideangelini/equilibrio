const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/SimpleBookingForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add registerPatient to imports
content = content.replace(
    /getPatientByPhone,\n\s*loginPatient/,
    `getPatientByPhone,
    loginPatient,
    registerPatient`
);

// 2. Add state variables
content = content.replace(
    /const \[email, setEmail\] = useState\(""\);/,
    `const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");`
);

// 3. Update handleRegisterStep
const oldHandleRegister = `    const handleRegisterStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            toast.error("Preencha todos os campos.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (password.length < 4) {
            toast.error("A senha deve ter pelo menos 4 dígitos.");
            return;
        }
        setStep(2); // Valid registration data, move to calendar
    };`;

const newHandleRegister = `    const handleRegisterStep = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword || !username || !dateOfBirth) {
            toast.error("Preencha todos os campos.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (password.length < 4) {
            toast.error("A senha deve ter pelo menos 4 dígitos.");
            return;
        }
        
        setLoading(true);
        try {
            const result = await registerPatient({
                name,
                email,
                phone,
                username,
                dateOfBirth,
                password
            });

            if (result.success) {
                toast.success("Cadastro realizado com sucesso!");
                setStep(2);
            } else {
                toast.error(result.error || "Erro ao realizar cadastro.");
            }
        } catch (error) {
            toast.error("Erro ao realizar cadastro.");
        } finally {
            setLoading(false);
        }
    };`;

content = content.replace(oldHandleRegister, newHandleRegister);

// 4. Update UI in Step 1.1
const emailInput = `                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="h-12 pl-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>`;

const newInputs = `                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Data de Nascimento</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <Input 
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="h-12 pl-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20 text-stone-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Usuário</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <Input 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Ex: joaosilva"
                                        className="h-12 pl-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="h-12 pl-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                />
                            </div>
                        </div>`;

content = content.replace(emailInput, newInputs);

// 5. Update handleBooking to pass SESSION_ACTIVE
content = content.replace(
    /password: isExistingPatient \? "SESSION_ACTIVE" : password,/,
    `password: "SESSION_ACTIVE",` // because even new patients are now registered beforehand
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SimpleBookingForm.tsx patched successfully.');
