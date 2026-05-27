"use client";

import { useState } from "react";
import { loginPatient, loginPsychologist } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, ArrowRight, Phone, MessageSquare, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { Suspense } from "react";
import UnifiedLoginForm from "./UnifiedLoginForm";

export default function UnifiedLoginPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <UnifiedLoginForm />
        </Suspense>
    );
}

