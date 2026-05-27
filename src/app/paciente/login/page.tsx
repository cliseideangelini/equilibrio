import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PatientLoginRedirect({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
    const params = await searchParams;
    const redirectUrl = params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : "";
    redirect(`/login${redirectUrl}`);
}
