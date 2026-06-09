export const BUILTIN_PREFERENCE_CATEGORIES = [
  "FOOD",
  "RESTAURANT",
  "GIFT",
  "PLACE",
  "OTHER",
] as const;

export type BuiltinPreferenceCategory =
  (typeof BUILTIN_PREFERENCE_CATEGORIES)[number];

export const CUSTOM_CATEGORY_PREFIX = "custom:";

export type CustomPreferenceCategory = {
  id: string;
  label: string;
};

export type PreferenceCategoryOption = {
  value: string;
  label: string;
};

export function isBuiltinPreferenceCategory(
  value: string,
): value is BuiltinPreferenceCategory {
  return (BUILTIN_PREFERENCE_CATEGORIES as readonly string[]).includes(value);
}

export function toCategoryRef(
  category: string,
  customCategoryId?: string | null,
): string {
  if (customCategoryId) {
    return `${CUSTOM_CATEGORY_PREFIX}${customCategoryId}`;
  }

  return category;
}

export function parseCategoryRef(categoryRef: string): {
  category: string;
  customCategoryId: string | null;
} {
  if (categoryRef.startsWith(CUSTOM_CATEGORY_PREFIX)) {
    return {
      category: "OTHER",
      customCategoryId: categoryRef.slice(CUSTOM_CATEGORY_PREFIX.length),
    };
  }

  return { category: categoryRef, customCategoryId: null };
}

export function buildPreferenceCategoryOptions(
  builtinOptions: PreferenceCategoryOption[],
  customCategories: CustomPreferenceCategory[],
): PreferenceCategoryOption[] {
  return [
    ...builtinOptions,
    ...customCategories.map((category) => ({
      value: toCategoryRef("OTHER", category.id),
      label: category.label,
    })),
  ];
}

export function resolvePreferenceCategoryLabel(
  category: string,
  customCategoryId: string | null | undefined,
  customCategories: CustomPreferenceCategory[],
  translateBuiltin: (key: BuiltinPreferenceCategory) => string,
): string {
  if (customCategoryId) {
    return (
      customCategories.find((entry) => entry.id === customCategoryId)?.label ??
      category
    );
  }

  if (isBuiltinPreferenceCategory(category)) {
    return translateBuiltin(category);
  }

  return category;
}

export function getPreferenceCategoryFilterKey(
  category: string,
  customCategoryId?: string | null,
): string {
  return toCategoryRef(category, customCategoryId);
}
