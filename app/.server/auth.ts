import { redirect } from "react-router";

export function getUserFromCookie(request: Request): number | null {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/session=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export function createSessionCookie(userId: number): string {
  return `session=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
}

export function clearSessionCookie(): string {
  return `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function requireUser(request: Request): Promise<number> {
  const userId = getUserFromCookie(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}
