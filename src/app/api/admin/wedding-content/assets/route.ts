import { fail } from "@/lib/server/http";

export async function POST() {
  return fail(
    410,
    "STATIC_CONTENT_MANAGED_IN_REPOSITORY",
    "Wedding content assets are managed as static project files.",
  );
}
