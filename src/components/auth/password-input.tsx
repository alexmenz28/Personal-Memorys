"use client";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
};

export function PasswordInput({
  id,
  name,
  autoComplete,
  minLength,
  required,
}: PasswordInputProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
      >
        {showPassword ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
