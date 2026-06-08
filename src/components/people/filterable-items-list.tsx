"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormActions } from "@/shared/components/layout/form-actions";
import { cn } from "@/shared/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const PREVIEW_COUNT = 3;

type CategoryOption = {
  value: string;
  label: string;
};

type FilterableItemsListProps<T extends { id: string }> = {
  items: T[];
  emptyMessage: string;
  noResultsMessage: string;
  viewAllLabel: (count: number) => string;
  viewLessLabel: string;
  searchPlaceholder?: string;
  getSearchText?: (item: T) => string;
  categoryFilter?: {
    getCategory: (item: T) => string;
    categories: CategoryOption[];
    allLabel: string;
  };
  filteredCountLabel?: (count: number, total: number) => string;
  renderItem: (item: T, context: "preview" | "full") => React.ReactNode;
};

export function FilterableItemsList<T extends { id: string }>({
  items,
  emptyMessage,
  noResultsMessage,
  viewAllLabel,
  viewLessLabel,
  searchPlaceholder,
  getSearchText,
  categoryFilter,
  filteredCountLabel,
  renderItem,
}: FilterableItemsListProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const previewItems = items.slice(0, PREVIEW_COUNT);
  const hasFilters = Boolean(searchPlaceholder || categoryFilter);
  const showExpand = items.length > PREVIEW_COUNT || hasFilters;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        !categoryFilter ||
        activeCategory === "ALL" ||
        categoryFilter.getCategory(item) === activeCategory;

      const matchesQuery =
        !normalizedQuery ||
        !getSearchText ||
        getSearchText(item).toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, categoryFilter, getSearchText, items, query]);

  function handleToggleExpanded() {
    setExpanded((current) => {
      if (current) {
        setQuery("");
        setActiveCategory("ALL");
      }

      return !current;
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {!expanded ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {previewItems.map((item) => (
            <div key={item.id} className="min-w-0">
              {renderItem(item, "preview")}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-3">
          {searchPlaceholder ? (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : null}

          {categoryFilter ? (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory("ALL")}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  activeCategory === "ALL"
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border/60 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {categoryFilter.allLabel}
              </button>
              {categoryFilter.categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    activeCategory === category.value
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border/60 bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          ) : null}

          {filteredCountLabel && (query || activeCategory !== "ALL") ? (
            <Badge variant="outline" className="font-normal">
              {filteredCountLabel(filteredItems.length, items.length)}
            </Badge>
          ) : null}

          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {noResultsMessage}
              </p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="min-w-0">
                  {renderItem(item, "full")}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showExpand ? (
        <FormActions>
          <Button variant="outline" size="sm" onClick={handleToggleExpanded}>
            {expanded ? viewLessLabel : viewAllLabel(items.length)}
          </Button>
        </FormActions>
      ) : null}
    </div>
  );
}
