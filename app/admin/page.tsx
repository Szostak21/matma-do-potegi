import { notFound } from "next/navigation";

import { verifyAdminSecret } from "@/lib/auth";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret } = await searchParams;

  if (!verifyAdminSecret(secret)) {
    notFound();
  }

  return null;
}
