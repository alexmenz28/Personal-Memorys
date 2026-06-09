import { PeopleWithPanel } from "@/modules/people/components/people-with-panel";
import { requireCurrentUserProfile } from "@/modules/auth/server/session";
import { loadPersonDetail } from "@/modules/people/server/loaders";
import { getCachedPeopleList } from "@/modules/people/server/cached-queries";
import { preferenceCategoryRepository } from "@/modules/people/server/preference-category.repository";
import { getDateStringInTimezone } from "@/shared/lib/dates";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

type PeoplePageProps = {
  searchParams: Promise<{ person?: string }>;
};

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const { person: personId } = await searchParams;
  const t = await getTranslations("people");
  const profile = await requireCurrentUserProfile();

  const [people, initialSelectedPerson, customPreferenceCategories] =
    await Promise.all([
      getCachedPeopleList(profile.id),
      personId ? loadPersonDetail(personId, profile.id) : Promise.resolve(null),
      preferenceCategoryRepository.findManyForProfile(profile.id),
    ]);

  if (personId && !initialSelectedPerson) {
    notFound();
  }

  return (
    <PeopleWithPanel
      people={people}
      initialSelectedPersonId={personId ?? null}
      initialSelectedPerson={initialSelectedPerson}
      listTitle={t("title")}
      listSubtitle={t("subtitle")}
      today={getDateStringInTimezone(profile.timezone)}
      customPreferenceCategories={customPreferenceCategories}
    />
  );
}
