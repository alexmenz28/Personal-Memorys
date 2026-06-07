import "server-only";

import type { ActionResult } from "@/shared/lib/action-result";
import { ZodError } from "zod";

export type { ActionResult };

export function actionError(
  error: unknown,
  fallback = "Something went wrong",
): ActionResult<never> {
  if (error instanceof ZodError) {
    return { ok: false, error: "Invalid input", code: "VALIDATION" };
  }

  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: fallback, code: "UNKNOWN" };
}

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return actionError(error);
  }
}
