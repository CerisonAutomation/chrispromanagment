/**
 * Prisma initialization check
 * Ensures @prisma/client is properly generated before use
 */

export async function ensurePrismaGenerated(): Promise<boolean> {
  try {
    // Check if Prisma client is available
    const PrismaModule = await import("@prisma/client");
    if (PrismaModule?.PrismaClient) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Prisma Init] Prisma client not initialized:", error);
    return false;
  }
}

export function getPrismaErrorMessage(): string {
  return `Prisma client is not initialized. Please run:
  
  bun prisma generate
  
Then restart the dev server.`;
}
