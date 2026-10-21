// GET    /api/admin/settings/[key] — read one section's content (admin).
// PUT    /api/admin/settings/[key] — replace one section's content (admin).
//
// The key selects the schema that validates the payload, so invalid
// or unexpected shapes are rejected before they reach the database.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { adminApiGuard } from "@/lib/admin.js";
import { SETTING_KEYS } from "@/lib/settings.js";
import { settingSchemas, fieldErrors } from "@/lib/validation.js";

function badKey() {
  return NextResponse.json(
    { error: "Unknown settings key." },
    { status: 404 },
  );
}

export async function GET(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { key } = await params;
  if (!SETTING_KEYS.includes(key)) return badKey();

  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }
  return NextResponse.json(row.data);
}

export async function PUT(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { key } = await params;
  if (!SETTING_KEYS.includes(key)) return badKey();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const schema = settingSchemas[key];
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const row = await prisma.siteSetting.upsert({
    where: { key },
    update: { data: parsed.data },
    create: { key, data: parsed.data },
  });

  return NextResponse.json(row.data);
}
