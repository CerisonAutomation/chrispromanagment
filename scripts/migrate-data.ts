// =============================================================================
// DATA MIGRATION SCRIPT
// Migrates existing CmsPage.data to draftData + publishedData
// Run: npx tsx scripts/migrate-data.ts
// =============================================================================

import {db} from '../src/lib/db';

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  // Use raw query to bypass type checking during migration
  const pages = await db.$queryRaw<{ id: string; slug: string; data: string; updatedAt: Date }[]>`
    SELECT id, slug, data, updatedAt FROM CmsPage WHERE draftData IS NULL
  `;
  
  console.log(`📄 Found ${pages.length} pages to migrate`);
  
  for (const page of pages) {
    if (page.data) {
      // Use raw query to update with new fields
      await db.$executeRaw`
        UPDATE CmsPage 
        SET draftData = ${page.data},
            publishedData = ${page.data},
            status = 'PUBLISHED',
            publishedAt = ${page.updatedAt}
        WHERE id = ${page.id}
      `;
      console.log(`✅ Migrated page: ${page.slug}`);
    }
  }
  
  console.log('✨ Migration complete!');
  process.exit(0);
}

migrateData().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
