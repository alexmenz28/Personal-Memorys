import { inngest } from "@/modules/jobs/inngest/client";
import { inngestFunctions } from "@/modules/jobs/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
