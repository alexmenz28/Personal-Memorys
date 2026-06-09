import { auth } from "@clerk/nextjs/server";
import { resolveUserProfile } from "@/modules/auth/server/session";
import {
  buildExportFilename,
  buildUserExport,
  buildUserExportCsv,
} from "@/modules/export/server/service";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await resolveUserProfile();

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const data = await buildUserExport(profile.id);
  const filename = buildExportFilename(format);

  if (format === "csv") {
    const csv = buildUserExportCsv(data);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
