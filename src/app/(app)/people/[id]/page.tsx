import { PersonDetail } from "@/components/people/person-detail";
import { AppShell } from "@/components/layout/app-shell";
import { requireCurrentUserProfile } from "@/lib/auth";
import { getPersonForProfile } from "@/lib/people";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const t = await getTranslations("people");
  const profile = await requireCurrentUserProfile();
  const person = await getPersonForProfile(id, profile.id);

  if (!person) {
    notFound();
  }

  return (
    <AppShell title={person.name} subtitle={t("detailSubtitle")}>
      <PersonDetail person={person} />
    </AppShell>
  );
}
