const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking appointments for May 28th, 2026...");
    
    // Find appointments scheduled for May 28th (represented as 14:30 UTC in database)
    const apps = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: new Date("2026-05-28T00:00:00.000Z"),
                lte: new Date("2026-05-28T23:59:59.000Z")
            }
        },
        include: {
            patient: true
        }
    });

    console.log(`Found ${apps.length} appointments:`);
    for (const app of apps) {
        console.log(`- Patient: ${app.patient.name}, Phone: ${app.patient.phone}`);
        console.log(`  Current UTC Start: ${app.startTime.toISOString()}`);
        console.log(`  Current UTC End:   ${app.endTime.toISOString()}`);

        // If the start time is exactly 14:30 UTC (which was 11:30 local before the fix)
        // and we want it to be 14:30 local (which is 17:30 UTC):
        if (app.startTime.toISOString() === "2026-05-28T14:30:00.000Z") {
            const newStart = new Date("2026-05-28T17:30:00.000Z");
            const newEnd = new Date("2026-05-28T18:00:00.000Z");

            await prisma.appointment.update({
                where: { id: app.id },
                data: {
                    startTime: newStart,
                    endTime: newEnd,
                    status: "PENDING" // Reset to pending/confirmed so it shows in future
                }
            });
            console.log(`  -> UPDATED to 17:30 UTC (14:30 local)!`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
