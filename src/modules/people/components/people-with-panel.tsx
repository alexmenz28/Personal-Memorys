"use client";

import { FadePresence } from "@/components/motion/fade-in";
import { CreatePersonDialog } from "@/components/people/create-person-dialog";
import { PeopleList } from "@/components/people/people-list";
import { PersonDetail } from "@/components/people/person-detail";
import { fetchPersonDetail } from "@/modules/people/actions/people.actions";
import { PersonSlidePanel } from "@/modules/people/components/person-slide-panel";
import { EventSlidePanel } from "@/modules/events/components/event-slide-panel";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import { toIsoString } from "@/shared/lib/dates";
import { PersonDetailSkeleton } from "@/shared/components/layout/content-skeleton";
import { PageActions, SetPageChrome } from "@/shared/components/layout/page-chrome";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

type PersonListItem = {
  id: string;
  name: string;
  relationship: string;
  notes: string | null;
  createdAt: Date | string;
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
  people: initialPeople,
  initialSelectedPerson,
  initialSelectedPersonId,
  listTitle,
  listSubtitle,
}: PeopleWithPanelProps) {
  const t = useTranslations("people");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [people, setPeople] = useState(initialPeople);

  useEffect(() => {
    setPeople(initialPeople);
  }, [initialPeople]);

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
  const [eventPanelOpen, setEventPanelOpen] = useState(false);
  const [eventPersonIds, setEventPersonIds] = useState<string[]>([]);

  const personOptions = useMemo<PersonOption[]>(
    () =>
      people.map((person) => ({
        id: person.id,
        name: person.name,
        createdAt: toIsoString(person.createdAt),
      })),
    [people],
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

  const handlePersonUpdated = useCallback(
    (updatedPerson: SelectedPerson) => {
      setPanelPerson(updatedPerson);
      setPanelTitle(updatedPerson.name);
      setPeople((current) =>
        current.map((person) =>
          person.id === updatedPerson.id
            ? {
                ...person,
                name: updatedPerson.name,
                _count: {
                  preferences: updatedPerson.preferences.length,
                  personNotes: updatedPerson.personNotes.length,
                },
              }
            : person,
        ),
      );
    },
    [],
  );

  const closePanel = useCallback(() => {
    setPanelPersonId(null);
    setPanelPerson(null);
    setPanelTitle(listTitle);
    setPanelLoading(false);
    syncUrl(null);
  }, [listTitle, syncUrl]);

  const handlePersonCreated = useCallback(
    (created: {
      id: string;
      name: string;
      relationship: string;
      notes: string | null;
    }) => {
      const listItem: PersonListItem = {
        id: created.id,
        name: created.name,
        relationship: created.relationship,
        notes: created.notes,
        createdAt: new Date().toISOString(),
        _count: { preferences: 0, personNotes: 0 },
      };

      setPeople((current) => {
        if (current.some((person) => person.id === created.id)) {
          return current;
        }

        return [...current, listItem].sort((left, right) =>
          left.name.localeCompare(right.name),
        );
      });

      setPanelPersonId(created.id);
      setPanelPerson({
        id: created.id,
        name: created.name,
        relationship: created.relationship,
        notes: created.notes,
        preferences: [],
        personNotes: [],
      });
      setPanelTitle(created.name);
      setPanelLoading(false);
      syncUrl(created.id);
    },
    [syncUrl],
  );

  const handlePersonDeleted = useCallback(
    (personId: string) => {
      setPeople((current) =>
        current.filter((person) => person.id !== personId),
      );
      closePanel();
    },
    [closePanel],
  );

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

  const openCreateEventForPerson = useCallback((personId: string) => {
    setEventPersonIds([personId]);
    setEventPanelOpen(true);
  }, []);

  const closeEventPanel = useCallback(() => {
    setEventPanelOpen(false);
    setEventPersonIds([]);
  }, []);

  const showMobileDetail = Boolean(panelPersonId && !isDesktop);

  return (
    <>
      {panelPersonId ? (
        <SetPageChrome title={panelTitle} subtitle={t("detailSubtitle")} />
      ) : (
        <SetPageChrome
          title={listTitle}
          subtitle={listSubtitle}
          action={<CreatePersonDialog onCreated={handlePersonCreated} />}
        />
      )}
      {panelPersonId ? null : <PageActions />}

      {isDesktop ? (
        <PeopleList
          people={people}
          onSelectPerson={openPerson}
          onPersonCreated={handlePersonCreated}
        />
      ) : (
        <FadePresence presenceKey={showMobileDetail ? "detail" : "list"}>
          {showMobileDetail ? (
            panelLoading || !panelPerson ? (
              <PersonDetailSkeleton />
            ) : (
          <PersonDetail
            person={panelPerson}
            onBack={closePanel}
            onDeleted={() => handlePersonDeleted(panelPerson.id)}
            onPersonUpdated={handlePersonUpdated}
            onCreateEvent={openCreateEventForPerson}
          />
            )
          ) : (
            <PeopleList
              people={people}
              onSelectPerson={openPerson}
              onPersonCreated={handlePersonCreated}
            />
          )}
        </FadePresence>
      )}

      {isDesktop ? (
        <PersonSlidePanel open={Boolean(panelPersonId)} onClose={closePanel}>
          {panelLoading || !panelPerson ? (
            <PersonDetailSkeleton />
          ) : (
            <PersonDetail
              person={panelPerson}
              variant="panel"
              onDeleted={() => handlePersonDeleted(panelPerson.id)}
              onPersonUpdated={handlePersonUpdated}
              onCreateEvent={openCreateEventForPerson}
            />
          )}
        </PersonSlidePanel>
      ) : null}

      <EventSlidePanel
        open={eventPanelOpen}
        mode="create"
        people={personOptions}
        defaultPersonIds={eventPersonIds}
        stacked={isDesktop && Boolean(panelPersonId)}
        onClose={closeEventPanel}
        onCreated={closeEventPanel}
      />
    </>
  );
}
