/**
 * @deprecated Database initialization now handled by Drizzle
 */
export async function ensurePrismaGenerated(): Promise<boolean> {
    return true;
}

export function getPrismaErrorMessage(): string {
    return `Database is ready.`;
}
