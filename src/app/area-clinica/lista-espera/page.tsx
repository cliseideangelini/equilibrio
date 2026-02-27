import prisma from "@/lib/prisma";
import { WaitingListClient } from "@/components/WaitingListClient";

export const dynamic = "force-dynamic";

export default async function WaitingListPage() {
    const list = await prisma.waitingList.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-light text-stone-900 tracking-tight">
                        Lista de <span className="italic font-serif text-stone-500">Espera</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                        Gerencie pacientes aguardando por horários liberados
                    </p>
                </div>
            </header>

            <WaitingListClient initialList={list} />
        </div>
    );
}
