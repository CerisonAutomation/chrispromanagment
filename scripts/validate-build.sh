#!/bin/bash

# Build Validation Script
# Validates the project setup and configuration before deployment

set -e

echo "=================================================="
echo "Christiano Property Management - Build Validation"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION} installed"
else
    echo -e "${RED}✗${NC} Node.js not found"
    FAILED=$((FAILED + 1))
fi

# Check Bun version
echo "Checking Bun..."
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun -v)
    echo -e "${GREEN}✓${NC} Bun ${BUN_VERSION} installed"
else
    echo -e "${YELLOW}⚠${NC} Bun not found (optional)"
fi

# Check dependencies
echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${RED}✗${NC} node_modules not found, run 'bun install' or 'npm install'"
    FAILED=$((FAILED + 1))
fi

# Check TypeScript compilation
echo ""
echo "Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} tsconfig.json found"
else
    echo -e "${RED}✗${NC} tsconfig.json not found"
    FAILED=$((FAILED + 1))
fi

# Check Next.js config
echo ""
echo "Checking Next.js configuration..."
if [ -f "next.config.ts" ]; then
    # Check for the problematic Turbopack config
    if grep -q "turbopack:" next.config.ts; then
        if grep -q "/Users/" next.config.ts; then
            echo -e "${RED}✗${NC} next.config.ts contains hardcoded path (should be fixed)"
            FAILED=$((FAILED + 1))
        else
            echo -e "${GREEN}✓${NC} next.config.ts valid (no hardcoded paths)"
        fi
    else
        echo -e "${GREEN}✓${NC} next.config.ts valid"
    fi
else
    echo -e "${RED}✗${NC} next.config.ts not found"
    FAILED=$((FAILED + 1))
fi

# Check Prisma schema
echo ""
echo "Checking Prisma configuration..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} prisma/schema.prisma found"
else
    echo -e "${RED}✗${NC} prisma/schema.prisma not found"
    FAILED=$((FAILED + 1))
fi

# Check environment setup
echo ""
echo "Checking environment configuration..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example found"
else
    echo -e "${YELLOW}⚠${NC} .env.example not found"
fi

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local configured"
elif [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env configured"
else
    echo -e "${YELLOW}⚠${NC} No environment file found (create .env.local with your config)"
fi

# Check package.json
echo ""
echo "Checking package.json..."
if [ -f "package.json" ]; then
    if grep -q '"type": "module"' package.json; then
        echo -e "${GREEN}✓${NC} package.json has correct module type"
    else
        echo -e "${YELLOW}⚠${NC} package.json missing 'type: module' (non-critical)"
    fi
else
    echo -e "${RED}✗${NC} package.json not found"
    FAILED=$((FAILED + 1))
fi

# Check error boundary files
echo ""
echo "Checking error handling components..."
ERROR_FILES=(
    "src/app/error.tsx"
    "src/app/not-found.tsx"
    "src/app/global-error.tsx"
    "src/lib/error/boundary.tsx"
    "src/lib/error/logger.ts"
)

for file in "${ERROR_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file found"
    else
        echo -e "${YELLOW}⚠${NC} $file not found"
    fi
done

# Check API utilities
echo ""
echo "Checking API utilities..."
API_FILES=(
    "src/lib/api/middleware.ts"
    "src/lib/api/validation.ts"
    "src/lib/app-init.ts"
)

for file in "${API_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file found"
    else
        echo -e "${YELLOW}⚠${NC} $file not found"
    fi
done

# Final status
echo ""
echo "=================================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review .env.local and ensure all variables are set"
    echo "  2. Run 'bun run dev' to start development server"
    echo "  3. Run 'bun run build' to test production build"
    echo "  4. Check IMPROVEMENTS.md for feature documentation"
    exit 0
else
    echo -e "${RED}✗ $FAILED critical issues found${NC}"
    echo ""
    echo "Please fix the issues above before continuing."
    exit 1
fi
