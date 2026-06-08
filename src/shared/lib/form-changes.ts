export type FormChange = {
  field: string;
  label: string;
  before: string;
  after: string;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim();
}

function sameIds(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((id, index) => id === sortedB[index]);
}

type EventDiffInput = {
  title: string;
  description: string;
  date: string;
  isUndated: boolean;
  isRecurring: boolean;
  personIds: string[];
  reminderEnabled: boolean;
  reminderDaysBefore: number;
};

type EventDiffLabels = {
  title: string;
  description: string;
  date: string;
  undated: string;
  recurring: string;
  people: string;
  reminder: string;
  yes: string;
  no: string;
  empty: string;
  formatPeople: (names: string[]) => string;
  formatDate: (date: string, isUndated: boolean) => string;
  formatReminder: (enabled: boolean, daysBefore: number) => string;
};

export function diffEventFormChanges(
  initial: Partial<EventDiffInput>,
  current: EventDiffInput,
  personNamesById: Map<string, string>,
  labels: EventDiffLabels,
): FormChange[] {
  const changes: FormChange[] = [];

  const initialTitle = normalizeText(initial.title);
  if (initialTitle !== normalizeText(current.title)) {
    changes.push({
      field: "title",
      label: labels.title,
      before: initialTitle || labels.empty,
      after: normalizeText(current.title) || labels.empty,
    });
  }

  const initialDescription = normalizeText(initial.description);
  const currentDescription = normalizeText(current.description);
  if (initialDescription !== currentDescription) {
    changes.push({
      field: "description",
      label: labels.description,
      before: initialDescription || labels.empty,
      after: currentDescription || labels.empty,
    });
  }

  const initialUndated = initial.isUndated ?? false;
  const initialRecurring = initial.isRecurring ?? false;
  const initialDate = initial.date ?? "";

  const beforeSchedule = labels.formatDate(initialDate, initialUndated);
  const afterSchedule = labels.formatDate(current.date, current.isUndated);
  if (beforeSchedule !== afterSchedule) {
    changes.push({
      field: "schedule",
      label: labels.date,
      before: beforeSchedule,
      after: afterSchedule,
    });
  }

  if (initialRecurring !== current.isRecurring) {
    changes.push({
      field: "isRecurring",
      label: labels.recurring,
      before: initialRecurring ? labels.yes : labels.no,
      after: current.isRecurring ? labels.yes : labels.no,
    });
  }

  const initialReminderEnabled = initial.reminderEnabled ?? false;
  const initialReminderDays = initial.reminderDaysBefore ?? 7;
  const beforeReminder = labels.formatReminder(
    initialReminderEnabled,
    initialReminderDays,
  );
  const afterReminder = labels.formatReminder(
    current.reminderEnabled,
    current.reminderDaysBefore,
  );

  if (beforeReminder !== afterReminder) {
    changes.push({
      field: "reminder",
      label: labels.reminder,
      before: beforeReminder,
      after: afterReminder,
    });
  }

  const initialPersonIds = initial.personIds ?? [];
  if (!sameIds(initialPersonIds, current.personIds)) {
    const toNames = (ids: string[]) =>
      labels.formatPeople(
        ids.map((id) => personNamesById.get(id) ?? id),
      );

    changes.push({
      field: "personIds",
      label: labels.people,
      before: toNames(initialPersonIds),
      after: toNames(current.personIds),
    });
  }

  return changes;
}

type PersonDiffInput = {
  name: string;
  relationship: string;
  notes: string;
};

type PersonDiffLabels = {
  name: string;
  relationship: string;
  notes: string;
  empty: string;
  formatRelationship: (value: string) => string;
};

export function diffPersonProfileChanges(
  initial: PersonDiffInput,
  current: PersonDiffInput,
  labels: PersonDiffLabels,
): FormChange[] {
  const changes: FormChange[] = [];

  if (normalizeText(initial.name) !== normalizeText(current.name)) {
    changes.push({
      field: "name",
      label: labels.name,
      before: normalizeText(initial.name) || labels.empty,
      after: normalizeText(current.name) || labels.empty,
    });
  }

  if (initial.relationship !== current.relationship) {
    changes.push({
      field: "relationship",
      label: labels.relationship,
      before: labels.formatRelationship(initial.relationship),
      after: labels.formatRelationship(current.relationship),
    });
  }

  const initialNotes = normalizeText(initial.notes);
  const currentNotes = normalizeText(current.notes);
  if (initialNotes !== currentNotes) {
    changes.push({
      field: "notes",
      label: labels.notes,
      before: initialNotes || labels.empty,
      after: currentNotes || labels.empty,
    });
  }

  return changes;
}
