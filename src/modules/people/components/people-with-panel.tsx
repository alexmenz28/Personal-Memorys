"use client";

import { CreatePersonDialog } from "@/components/people/create-person-dialog";
import { PeopleList } from "@/components/people/people-list";
import { PersonDetail } from "@/components/people/person-detail";
import { fetchPersonDetail } from "@/modules/people/actions/people.actions";
import { PersonSlidePanel } from "@/modules/people/components/person-slide-panel";
import { EventSlidePanel } from "@/modules/events/components/event-slide-panel";
import type { PersonOption } from "@/modules/events/components/event-person-picker";
import type { CustomPreferenceCategory } from "@/modules/people/lib/preference-categories";
import { toIsoString } from "@/shared/lib/dates";
import { PersonDetailSkeleton } from "@/shared/components/layout/content-skeleton";
import { PageActions, SetPageChrome } from "@/shared/components/layout/page-chrome";
import { useServerSyncedState } from "@/shared/hooks/use-server-synced-state";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

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
    customCategoryId: string | null;
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
  today: string;
  customPreferenceCategories: CustomPreferenceCategory[];
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
  today,
  customPreferenceCategories,
}: PeopleWithPanelProps) {
  const t = useTranslations("people");
  const [people, setPeople] = useServerSyncedState(initialPeople);
  const [panelPersonId, setPanelPersonId] = useState<string | null>(
    initialSelectedPersonId,
  );
  const [panelPerson, setPanelPerson] = useState<SelectedPerson | null>(
    initialSelectedPerson,
  );
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [eventPanelOpen, setEventPanelOpen] = useState(false);
  const [eventPersonIds, setEventPersonIds] = useState<string[]>([]);
  const fetchRequestRef = useRef(0);
  const loadErrorMessageRef = useRef(t("loadError"));
  const initialSelectedPersonRef = useRef(initialSelectedPerson);

  useEffect(() => {
    initialSelectedPersonRef.current = initialSelectedPerson;
  }, [initialSelectedPerson]);

  useEffect(() => {
    loadErrorMessageRef.current = t("loadError");
  }, [t]);

  const syncUrl = useCallback((personId: string | null) => {
    window.history.replaceState(null, "", buildPersonUrl(personId));
  }, []);

  const loadPerson = useCallback(async (personId: string) => {
    const requestId = fetchRequestRef.current + 1;
    fetchRequestRef.current = requestId;

    setPanelLoading(true);
    setPanelError(null);

    try {
      const result = await fetchPersonDetail(personId);

      if (requestId !== fetchRequestRef.current) {
        return;
      }

      if (result.ok) {
        setPanelPerson(result.data);
        setPanelError(null);
      } else {
        setPanelPerson(null);
        setPanelError(result.error);
      }
    } catch {
      if (requestId !== fetchRequestRef.current) {
        return;
      }

      setPanelPerson(null);
      setPanelError(loadErrorMessageRef.current);
    } finally {
      if (requestId === fetchRequestRef.current) {
        setPanelLoading(false);
      }
    }
  }, []);

  const loadPersonRef = useRef(loadPerson);

  useEffect(() => {
    loadPersonRef.current = loadPerson;
  }, [loadPerson]);

  // Sync only when the URL-driven person id changes (server navigation).
  useEffect(() => {
    if (!initialSelectedPersonId) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setPanelPersonId(initialSelectedPersonId);

      const serverPerson = initialSelectedPersonRef.current;

      if (serverPerson?.id === initialSelectedPersonId) {
        setPanelPerson(serverPerson);
        setPanelLoading(false);
        setPanelError(null);
        return;
      }

      void loadPersonRef.current(initialSelectedPersonId);
    });

    return () => {
      cancelled = true;
    };
  }, [initialSelectedPersonId]);

  const openPerson = useCallback(
    (personId: string) => {
      setPanelPersonId(personId);
      syncUrl(personId);

      if (
        panelPerson?.id === personId &&
        !panelError
      ) {
        return;
      }

      if (
        initialSelectedPerson?.id === personId &&
        initialSelectedPersonId === personId
      ) {
        setPanelPerson(initialSelectedPerson);
        setPanelLoading(false);
        setPanelError(null);
        return;
      }

      void loadPerson(personId);
    },
    [
      initialSelectedPerson,
      initialSelectedPersonId,
      loadPerson,
      panelError,
      panelPerson?.id,
      syncUrl,
    ],
  );

  const handlePersonUpdated = useCallback(
    (updatedPerson: SelectedPerson) => {
      setPanelPerson(updatedPerson);
      setPanelError(null);
      setPeople((current) =>
        current.map((person) =>
          person.id === updatedPerson.id
            ? {
                ...person,
                name: updatedPerson.name,
                relationship: updatedPerson.relationship,
                notes: updatedPerson.notes,
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
    fetchRequestRef.current += 1;
    setPanelPersonId(null);
    setPanelPerson(null);
    setPanelLoading(false);
    setPanelError(null);
    syncUrl(null);
  }, [syncUrl]);

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
      setPanelLoading(false);
      setPanelError(null);
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
        closePanel();
        return;
      }

      setPanelPersonId(personId);
      void loadPersonRef.current(personId);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [closePanel]);

  const openCreateEventForPerson = useCallback((personId: string) => {
    setEventPersonIds([personId]);
    setEventPanelOpen(true);
  }, []);

  const closeEventPanel = useCallback(() => {
    setEventPanelOpen(false);
    setEventPersonIds([]);
  }, []);

  const personOptions: PersonOption[] = people.map((person) => ({
    id: person.id,
    name: person.name,
    createdAt: toIsoString(person.createdAt),
  }));

  return (
    <>
      <SetPageChrome
        title={listTitle}
        subtitle={listSubtitle}
        action={<CreatePersonDialog onCreated={handlePersonCreated} />}
      />
      <PageActions />

      <PeopleList
        people={people}
        onSelectPerson={openPerson}
        onPersonCreated={handlePersonCreated}
      />

      <PersonSlidePanel open={Boolean(panelPersonId)} onClose={closePanel}>
        {panelLoading ? (
          <PersonDetailSkeleton />
        ) : panelError ? (
          <div className="space-y-4 p-2">
            <p className="text-sm text-destructive">{panelError}</p>
            {panelPersonId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadPerson(panelPersonId)}
              >
                {t("retryLoad")}
              </Button>
            ) : null}
          </div>
        ) : panelPerson ? (
          <PersonDetail
            person={panelPerson}
            variant="panel"
            customPreferenceCategories={customPreferenceCategories}
            onDeleted={() => handlePersonDeleted(panelPerson.id)}
            onPersonUpdated={handlePersonUpdated}
            onCreateEvent={openCreateEventForPerson}
          />
        ) : (
          <PersonDetailSkeleton />
        )}
      </PersonSlidePanel>

      <EventSlidePanel
        open={eventPanelOpen}
        mode="create"
        people={personOptions}
        today={today}
        defaultPersonIds={eventPersonIds}
        stacked={Boolean(panelPersonId)}
        onClose={closeEventPanel}
        onCreated={closeEventPanel}
      />
    </>
  );
}
