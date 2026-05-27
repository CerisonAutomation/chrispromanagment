// Thin re-export so existing imports keep working.
// All auth state is owned by useAuthStore.
export { useAuthStore as useAuth } from "@/store/auth";
export async function signOut(): Promise<void> {
  const { useAuthStore } = await import("@/store/auth");
  await useAuthStore.getState().signOut();
}
