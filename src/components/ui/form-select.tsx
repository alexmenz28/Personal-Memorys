"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = {
  id?: string;
  "aria-label"?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  triggerClassName?: string;
  contentClassName?: string;
};

export function FormSelect({
  id,
  "aria-label": ariaLabel,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  size = "default",
  triggerClassName,
  contentClassName,
}: FormSelectProps) {
  return (
    <Select
      value={value}
      items={options}
      onValueChange={(nextValue) => {
        if (nextValue != null) {
          onValueChange(String(nextValue));
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel}
        className={cn("w-full", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
