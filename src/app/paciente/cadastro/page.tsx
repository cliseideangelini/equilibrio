"use client";

import { useState } from "react";
import { registerPatient } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Lock, ArrowRight, MessageSquare, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";import { Suspense } from "react";
import PatientRegisterForm from "./PatientRegisterForm";

export default function PatientRegisterPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <PatientRegisterForm />
        </Suspense>
    );
}
