"use client";

import { CreatePersonDialog } from "@/components/people/create-person-dialog";
import { PeopleList } from "@/components/people/people-list";
import { PersonDetail } from "@/components/people/person-detail";
import { fetchPersonDetail } from "@/modules/people/actions/people.actions";
import { PersonSlidePanel } from "@/modules/people/components/person-slide-panel";
import { PersonDetailSkeleton } from "@/shared/components/layout/content-skeleton";
import { PageActions, SetPageChrome } from "@/shared/components/layout/page-chrome";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type PersonListItem = {
  id: string;
  name: string;
  relationship: string;
  notes: string | null;
  _count: {
    preferences: number;
    personNotes: number;
  };
};

type SelectedPerson = {
  id: string;
  name: string;
  relationship: string;
  notes: string | null;
  preferences: Array<{
    id: string;
    category: string;
    label: string;
    value: string;
  }>;
  personNotes: Array<{ id: string; content: string }>;
};

type PeopleWithPanelProps = {
  people: PersonListItem[];
  initialSelectedPerson: SelectedPerson | null;
  initialSelectedPersonId: string | null;
  listTitle: string;
  listSubtitle: string;
};

function buildPersonUrl(personId: string | null) {
  return personId ? `/people?person=${personId}` : "/people";
}

export function PeopleWithPanel({
  people,
  initialSelectedPerson,
  initialSelectedPersonId,
  listTitle,
  listSubtitle,
}: PeopleWithPanelProps) {
  const t = useTranslations("people");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [panelPersonId, setPanelPersonId] = useState<string | null>(
    initialSelectedPersonId,
  );
  const [panelPerson, setPanelPerson] = useState<SelectedPerson | null>(
    initialSelectedPerson,
  );
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelTitle, setPanelTitle] = useState(
    initialSelectedPerson?.name ?? listTitle,
  );

  const syncUrl = useCallback((personId: string | null) => {
    window.history.replaceState(null, "", buildPersonUrl(personId));
  }, []);

  const loadPerson = useCallback(async (personId: string) => {
    setPanelLoading(true);
    const result = await fetchPersonDetail(personId);

    if (result.ok) {
      setPanelPerson(result.data);
      setPanelTitle(result.data.name);
    }

    setPanelLoading(false);
  }, []);

  const openPerson = useCallback(
    (personId: string, personName?: string) => {
      setPanelPersonId(personId);
      setPanelTitle(personName ?? listTitle);
      syncUrl(personId);

      if (panelPerson?.id !== personId) {
        setPanelPerson(null);
        void loadPerson(personId);
      }
    },
    [listTitle, loadPerson, panelPerson?.id, syncUrl],
  );

  const closePanel = useCallback(() => {
    setPanelPersonId(null);
    setPanelPerson(null);
    setPanelTitle(listTitle);
    setPanelLoading(false);
    syncUrl(null);
  }, [listTitle, syncUrl]);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const personId = params.get("person");

      if (!personId) {
        setPanelPersonId(null);
        setPanelPerson(null);
        setPanelTitle(listTitle);
        setPanelLoading(false);
        return;
      }

      const knownPerson = people.find((person) => person.id === personId);
      setPanelPersonId(personId);
      setPanelTitle(knownPerson?.name ?? listTitle);
      setPanelPerson(null);
      void loadPerson(personId);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [listTitle, loadPerson, people]);

  const showMobileDetail = Boolean(panelPersonId && !isDesktop);

  return (
    <>
      {panelPersonId ? (
        <SetPageChrome title={panelTitle} subtitle={t("detailSubtitle")} />
      ) : (
        <SetPageChrome
          title={listTitle}
          subtitle={listSubtitle}
          action={<CreatePersonDialog onCreated={openPerson} />}
        />
      )}
      <PageActions />

      {showMobileDetail ? (
        panelLoading || !panelPerson ? (
          <PersonDetailSkeleton />
        ) : (
          <PersonDetail
            person={panelPerson}
            onBack={closePanel}
            onDeleted={closePanel}
          />
        )
      ) : (
        <PeopleList people={people} onSelectPerson={openPerson} />
      )}

      {isDesktop ? (
        <PersonSlidePanel open={Boolean(panelPersonId)} onClose={closePanel}>
          {panelLoading || !panelPerson ? (
            <PersonDetailSkeleton />
          ) : (
            <PersonDetail person={panelPerson} variant="panel" />
          )}
        </PersonSlidePanel>
      ) : null}
    </>
  );
}
