# Quick Start Guide

## For Developers

### Get Started
```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local

# Generate Prisma client
bun db:generate

# Start development server
bun dev

# Open http://localhost:3000
```

### Key Commands
```bash
# Development
bun dev              # Start dev server
bun lint            # Lint code
bun type-check      # Check types

# Database
bun db:generate     # Generate Prisma client
bun db:push         # Sync schema
bun db:migrate      # Run migrations
bun db:reset        # Reset database

# Production
bun build           # Build for production
bun start           # Start production server
```

### Project Structure
```
src/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── [...puckPath]/   # Puck editor
│   ├── admin/           # Admin panel
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── error.tsx        # Error boundary
├── blocks/              # Page builder blocks
├── components/          # React components
│   ├── ui/             # UI components (shadcn)
│   ├── fields/         # Form fields
│   ├── puck/           # Puck editor components
│   └── admin/          # Admin components
├── lib/                # Core utilities
│   ├── api/            # API middleware & validation
│   ├── error/          # Error handling
│   ├── utils/          # Utility functions
│   ├── db.ts           # Database client
│   └── constants.ts    # Constants
└── autocomplete/       # Autocomplete system

prisma/
└── schema.prisma       # Database schema

public/
├── uploads/            # User uploaded files
└── images/             # Static images
```

### Import Aliases
```typescript
// Use these instead of relative paths
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { validateEmail } from '@/lib/utils'
import { SITE_BASE } from '@/lib/constants'
```

---

## API Endpoints

### Contact Form
```bash
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello!"
}
```

### Upload File
```bash
POST /api/upload
Content-Type: multipart/form-data

Form Data:
- file: <File>
```

### Get Properties
```bash
GET /api/properties
GET /api/properties?city=Valletta&featured=true
```

### Get Bookings
```bash
GET /api/bookings
GET /api/bookings?status=confirmed&propertyId=xxx
```

---

## Utility Functions

### String Utilities
```typescript
import { 
  slugify, 
  capitalize, 
  sanitizeHtml,
  isValidEmail 
} from '@/lib/utils'

slugify("Hello World")        // "hello-world"
capitalize("john")            // "John"
sanitizeHtml("<script>")      // "&lt;script&gt;"
isValidEmail("test@mail.com") // true
```

### Validation Utilities
```typescript
import { 
  validateEmail, 
  validatePassword,
  validateFile,
  validateSlug 
} from '@/lib/utils'

const email = validateEmail("test@mail.com")
// { valid: true }

const pwd = validatePassword("weak")
// { valid: false, errors: [...] }

const file = validateFile(fileObj)
// { valid: true } or { valid: false, error: "..." }
```

### Format Utilities
```typescript
import { 
  formatCurrency, 
  formatDate,
  formatRelativeTime,
  formatFileSize 
} from '@/lib/utils'

formatCurrency(99.99, "EUR")    // "€99.99"
formatDate(new Date())          // "April 06, 2026"
formatRelativeTime(pastDate)    // "2 hours ago"
formatFileSize(1024000)         // "1000 KB"
```

---

## Common Tasks

### Add a New API Route
```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const data = await db.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API/MyEndpoint]', error)
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    )
  }
}
```

### Add a New Component
```typescript
// src/components/my-component.tsx
'use client'

import React from 'react'

interface MyComponentProps {
  title: string
  onClick?: () => void
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div onClick={onClick}>
      {title}
    </div>
  )
}
```

### Add Database Model
```prisma
// prisma/schema.prisma
model MyModel {
  id    String   @id @default(cuid())
  name  String
  email String   @unique
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
}
```

Then run:
```bash
bun db:push
bun db:generate
```

### Use Error Boundary
```typescript
'use client'

import { ErrorBoundary } from '@/lib/error'

export default function Page() {
  return (
    <ErrorBoundary level="page">
      <YourComponent />
    </ErrorBoundary>
  )
}
```

---

## Debugging

### Enable Debug Logging
```bash
# Development
DEBUG_PRISMA=true bun dev

# Production
DEBUG_MODE=true NODE_ENV=production bun start
```

### Check Logs
```bash
# Development
bun dev 2>&1 | grep -i error

# Production with pm2
pm2 logs

# Or with journalctl
journalctl -u app -f
```

### Type Check
```bash
# Check for type errors
bun exec tsc --noEmit

# Watch mode
bun exec tsc --noEmit --watch
```

---

## Environment Variables

### Required
```env
DATABASE_URL=sqlite:./db/custom.db
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Optional
```env
DEBUG_MODE=false
DEBUG_PRISMA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_BETA=false
```

---

## Deployment

### To Vercel
```bash
# Connect repository
# 1. Push to GitHub
git push origin main

# 2. Visit https://vercel.com/new
# 3. Select your repository
# 4. Configure environment variables
# 5. Deploy!
```

### To Self-Hosted
```bash
# Build
bun build

# Set environment
export NODE_ENV=production
export DATABASE_URL="..."

# Run
bun .next/standalone/server.js
```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Common Issues

### "Prisma client not initialized"
```bash
bun db:generate
```

### Build fails with TypeScript errors
```bash
bun exec tsc --noEmit
# Fix the reported errors
```

### Database connection fails
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
bunx prisma db execute --stdin < test.sql
```

### Port already in use
```bash
bun dev -p 3001  # Use different port
```

---

## Resources

- **Documentation:** See CODEBASE_AUDIT.md
- **Deployment:** See DEPLOYMENT_GUIDE.md
- **Checklist:** See BUILD_CHECKLIST.md
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## Support

For issues or questions:
1. Check the relevant documentation file
2. Review error logs with proper verbosity
3. Check CODEBASE_AUDIT.md for technical details
4. Review similar working implementations in codebase

**Happy coding!** 🚀
