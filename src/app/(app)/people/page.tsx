import { CreatePersonDialog } from "@/components/people/create-person-dialog";
import { PeopleList } from "@/components/people/people-list";
import { AppShell } from "@/components/layout/app-shell";
import { requireCurrentUserProfile } from "@/lib/auth";
import { getPeopleForProfile } from "@/lib/people";
import { getTranslations } from "next-intl/server";

export default async function PeoplePage() {
  const t = await getTranslations("people");
  const profile = await requireCurrentUserProfile();
  const people = await getPeopleForProfile(profile.id);

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      action={<CreatePersonDialog />}
    >
      <PeopleList people={people} />
    </AppShell>
  );
}
