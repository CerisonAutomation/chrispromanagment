// Stub for db - provides basic db interface that accepts anything
export const db: any = {
  cmsPages: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  pages: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  bookings: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  properties: {
    findMany: async () => [],
    findUnique: async () => null,
  },
};

export const sqlite: any = {
  prepare: (sql: string) => ({
    all: () => [],
    get: () => null,
    run: () => ({ changes: 0 }),
  }),
};

// Stub for Drizzle-style insert/update/delete
export const drizzleDb = {
  insert: (table: any) => ({
    values: () => ({ run: async () => ({ insertId: 0 }) }),
    valuesBatch: () => ({ run: async () => ({ insertId: 0 }) }),
  }),
  update: (table: any) => ({
    set: () => ({ where: () => ({ run: async () => ({ changes: 0 }) }) }),
  }),
  delete: (table: any) => ({
    where: () => ({ run: async () => ({ changes: 0 }) }),
  }),
};
