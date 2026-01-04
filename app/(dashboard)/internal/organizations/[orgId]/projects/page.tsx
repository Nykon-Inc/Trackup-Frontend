import { redirect } from "next/navigation";

export default async function OrganizationProjectsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params;
    redirect(`/internal/organizations/${orgId}`);
}
