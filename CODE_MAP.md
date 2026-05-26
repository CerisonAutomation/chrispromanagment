# Complete Code Map & Feature Mapping

## 🗺️ System Code Map

### Frontend Layer (`src/`)

#### Components Architecture
```
src/components/
├── admin/                    # Admin Dashboard Components
│   ├── aiassistant.tsx      # AI Assistant Interface
│   ├── block-library.tsx    # Block Library Panel
│   ├── cache-debug-panel.tsx # Cache Debugging Interface
│   ├── gmail-inbox-panel.tsx # Gmail Integration Panel
│   ├── live-blocks.tsx      # Live Block Editor
│   ├── live-navigate-mode.tsx # Live Navigation Mode
│   ├── media-library.tsx    # Media Asset Management
│   ├── page-editor.tsx      # Page Editor Interface
│   ├── seo-overrides-panel.tsx # SEO Override Panel
│   ├── theme-editor.tsx     # Theme Customization Editor
│   └── version-history-panel.tsx # Version History Viewer
├── analytics/              # Analytics Dashboard Components
│   ├── bookings-chart.tsx  # Booking Statistics Chart
│   ├── occupancy-chart.tsx # Occupancy Rate Visualization
│   ├── revenue-chart.tsx   # Revenue Analytics Display
│   └── top-properties-table.tsx # Top Performing Properties
├── blocks/                 # CMS Block Components
│   └── carousel-hero.tsx   # Hero Carousel Block
├── chat/                   # Chat System Components
│   ├── chat-window.tsx     # Chat Interface
│   ├── message-bubble.tsx  # Message Display Component
│   └── typing-indicator.tsx # Typing State Indicator
├── contracts/              # Contract Management
│   └── ContractSigning.tsx # Digital Contract Signing
├── media/                  # Media Components
│   ├── lightbox.tsx        # Image Lightbox Viewer
│   ├── property-gallery.tsx # Property Image Gallery
│   └── smart-image.tsx     # Optimized Image Component
├── modals/                 # Modal Components
│   ├── ContactModal.tsx    # Contact Form Modal
│   └── PropertyOwnerModal.tsx # Property Owner Modal
├── pricing/                # Pricing Components
│   ├── forecast-table.tsx  # Pricing Forecast Table
│   └── pricing-chart.tsx   # Pricing Analytics Chart
├── ui/                     # UI Component Library (shadcn/ui)
│   ├── accordion.tsx       # Collapsible Content
│   ├── alert-dialog.tsx    # Alert Dialogs
│   ├── alert.tsx           # Alert Notifications
│   ├── aspect-ratio.tsx    # Aspect Ratio Container
│   ├── avatar.tsx          # User Avatar
│   ├── badge.tsx           # Status Badges
│   ├── breadcrumb.tsx      # Navigation Breadcrumbs
│   ├── button.tsx          # Button Components
│   ├── calendar.tsx        # Calendar Picker
│   ├── card.tsx            # Card Containers
│   ├── carousel.tsx        # Image Carousel
│   ├── checkbox.tsx        # Checkbox Inputs
│   ├── collapsible.tsx     # Collapsible Panels
│   ├── command.tsx         # Command Palette
│   ├── context-menu.tsx    # Context Menus
│   ├── dialog.tsx          # Dialog Windows
│   ├── drawer.tsx          # Side Drawers
│   ├── dropdown-menu.tsx   # Dropdown Menus
│   ├── form.tsx            # Form Components
│   ├── hover-card.tsx      # Hover Cards
│   ├── input-otp.tsx       # OTP Input
│   ├── input.tsx           # Text Inputs
│   ├── label.tsx           # Form Labels
│   ├── loading-spinner.tsx # Loading Indicators
│   ├── menubar.tsx         # Application Menu Bar
│   ├── navigation-menu.tsx # Navigation Menus
│   ├── pagination.tsx      # Pagination Controls
│   ├── popover.tsx         # Popover Components
│   ├── progress.tsx        # Progress Indicators
│   ├── radio-group.tsx     # Radio Button Groups
│   ├── resizable.tsx       # Resizable Panels
│   ├── scroll-area.tsx     # Scrollable Areas
│   ├── select.tsx          # Select Dropdowns
│   ├── separator.tsx       # Visual Separators
│   ├── sheet.tsx           # Sheet Panels
│   ├── skeleton.tsx        # Loading Skeletons
│   ├── slider.tsx          # Range Sliders
│   ├── sonner.tsx          # Toast Notifications
│   ├── switch.tsx          # Toggle Switches
│   ├── table.tsx           # Data Tables
│   ├── tabs.tsx            # Tab Navigation
│   ├── textarea.tsx        # Text Areas
│   ├── toggle-group.tsx    # Toggle Button Groups
│   ├── toggle.tsx          # Toggle Buttons
│   └── tooltip.tsx         # Tooltips
├── ar/                     # Augmented Reality
│   └── ARViewer.tsx        # AR Property Viewer
├── checkout-extras-panel.tsx # Checkout Extras Panel
├── concierge/              # AI Concierge
│   └── ConciergeChat.tsx   # AI Chat Interface
├── cookie-consent.tsx      # Cookie Consent Banner
├── edit-mode-bridge.tsx    # Edit Mode Bridge
├── error-boundary.tsx      # Error Boundary Component
├── language-switcher.tsx   # Language Switcher
├── property-card.tsx       # Property Listing Card
├── search-widget.tsx       # Property Search Widget
├── sticky-call-to-action.tsx # Sticky CTA Component
├── stripe-inline-payment.tsx # Stripe Payment Integration
├── voice/                  # Voice Recognition
│   └── VoiceSearchButton.tsx # Voice Search Interface
└── web3/                   # Web3 Integration
    ├── MintButton.tsx      # NFT Minting Button
    └── WalletConnectButton.tsx # Wallet Connection
```

#### Core Architecture (`src/core/`)
```
src/core/
├── cqrs-pattern.ts         # CQRS Implementation
│   ├── ICommand Interface  # Command Interface
│   ├── IQuery Interface    # Query Interface
│   ├── CommandBus          # Command Execution Bus
│   ├── QueryBus            # Query Execution Bus
│   ├── CommandResult       # Command Result Wrapper
│   ├── CommandHandler      # Base Command Handler
│   ├── QueryHandler        # Base Query Handler
│   ├── CommandEvent        # Event Structure
│   ├── CommandEventPublisher # Event Publisher
│   └── WithEvents Decorator # Event Publishing Decorator
├── repository-pattern.ts   # Repository Implementation
│   ├── IRepository Interface # Repository Interface
│   ├── RepositoryFilter    # Query Filters
│   ├── PaginationOptions   # Pagination Configuration
│   ├── PaginatedResult     # Pagination Result
│   ├── BaseRepository      # Base Repository
│   ├── InMemoryRepository  # In-Memory Implementation
│   └── CachedRepository    # Caching Repository
├── strategy-pattern.ts     # Strategy Implementation
│   ├── IStrategy Interface # Strategy Interface
│   ├── StrategyContext     # Strategy Context
│   ├── StrategyFactory     # Strategy Factory
│   ├── StrategyChain       # Strategy Chain
│   ├── CompositeStrategy   # Composite Strategy
│   ├── AdaptiveStrategy   # Adaptive Strategy
│   └── StrategyRegistry   # Global Registry
├── service-container.ts    # DI Implementation
│   ├── ServiceLifetime     # Lifetime Types
│   ├── ServiceDescriptor  # Service Descriptor
│   ├── ServiceContainer    # Container Implementation
│   ├── Injectable Decorator # Service Registration
│   ├── serviceContainer    # Global Instance
│   ├── registerService     # Registration Helper
│   ├── resolveService      # Resolution Helper
│   ├── autoRegister       # Auto Registration
│   └── ServiceLocator      # Service Locator
└── index.ts                # Core Exports
```

#### Infrastructure Libraries (`src/lib/`)
```
src/lib/
├── advancedBlocks.ts       # Advanced Block Definitions
├── amenityIcons.ts         # Amenity Icon Mappings
├── analytics-engine.ts     # Analytics Processing Engine
├── api-client.ts           # Generic API Client
├── blockRegistry.ts        # Block Registry System
├── blocks.tsx              # Block Component Definitions
├── concierge-ai.ts         # AI Concierge Integration
├── error-handler.ts        # Error Handler
├── gmail.ts                # Gmail Integration
├── guesty.ts               # Guesty API Client
├── guestyPricing.ts        # Guesty Pricing Logic
├── i18n-utils.ts           # Internationalization Utils
├── index.ts                # Library Exports
├── logger.ts               # Logging Utilities
├── monitoring.ts           # Monitoring System
├── otel-observability.ts   # OpenTelemetry Framework
│   ├── LogLevel Enum       # Logging Levels
│   ├── LogEntry Interface  # Log Structure
│   ├── MetricEntry Interface # Metric Structure
│   ├── SpanContext Interface # Tracing Context
│   ├── OtelLogger          # Structured Logger
│   ├── MetricsCollector    # Metrics Collection
│   ├── DistributedTracing # Distributed Tracing
│   ├── observability       # Global Instance
│   ├── Traced Decorator    # Method Tracing
│   └── Convenience Exports
├── owasp-security-audit.ts # Security Framework
│   ├── OWASPCategory Enum  # OWASP Categories
│   ├── SecurityIssue Interface # Issue Structure
│   ├── SecurityAuditResult Interface # Audit Results
│   ├── OWASPSecurityAuditor # Auditor Class
│   ├── SecurityMiddleware # Security Middleware
│   └── securityAuditor    # Global Instance
├── perf.ts                 # Performance Utilities
├── performance-optimizer.ts # Performance Framework
│   ├── PerformanceMonitor  # Performance Monitoring
│   ├── CacheManager        # Cache Management
│   ├── Debouncer           # Request Debouncing
│   ├── Throttler           # Request Throttling
│   ├── MemoryMonitor       # Memory Monitoring
│   ├── PerformanceOptimizer # Optimizer Class
│   └── performanceOptimizer # Global Instance
├── pricing-engine.ts       # Pricing Engine
├── smart-contracts.ts      # Smart Contract Integration
├── testing-framework.ts    # Testing Framework
│   ├── TestType Enum       # Test Types
│   ├── TestSuite Interface # Test Suite Structure
│   ├── TestCase Interface # Test Case Structure
│   ├── TestResult Interface # Test Result Structure
│   ├── TestRunReport Interface # Test Report Structure
│   ├── UnitTestRunner      # Unit Test Runner
│   ├── IntegrationTestRunner # Integration Test Runner
│   ├── E2ETestRunner       # E2E Test Runner
│   ├── TestPyramidOrchestrator # Test Orchestrator
│   ├── TestHelpers         # Test Utilities
│   └── testOrchestrator   # Global Instance
├── themeTokens.ts          # Theme Token System
├── utils.ts                # General Utilities
├── voice-recognition.ts    # Voice Recognition
├── web3.ts                 # Web3 Integration
└── websocket.ts            # WebSocket Client
```

#### Integration Layer (`src/integrations/`)
```
src/integrations/
├── guesty/                 # Guesty Integration
│   └── enterprise-guesty-client.ts # Enterprise Guesty Client
│       ├── EnterpriseGuestyClient # Main Client Class
│       ├── GuestyRepository # Repository Implementation
│       ├── BookingCommand # Booking Commands
│       ├── ListingQuery    # Listing Queries
│       ├── PricingStrategy # Pricing Strategies
│       └── Error Handling
└── supabase/               # Supabase Integration
    ├── client.ts           # Supabase Client Configuration
    ├── types.ts            # Supabase Type Definitions
    └── index.ts            # Integration Exports
```

#### Context & State Management
```
src/context/
├── cms-defaults.ts         # CMS Default Context
├── cmscontext.tsx          # CMS Context Provider
└── modal-context.tsx       # Modal Context Provider

src/hooks/
├── use-auth.ts             # Authentication Hook
└── useBlock.ts             # Block Management Hook

src/store/
└── auth.ts                 # Authentication Store (Zustand)
```

#### Pages Layer
```
src/pages/
├── landing-page.tsx        # Landing Page
├── properties-page.tsx      # Properties Listing Page
├── property-detail-page.tsx # Property Detail Page
├── checkout-page.tsx       # Checkout Page
├── confirmation-page.tsx   # Booking Confirmation Page
├── auth-page.tsx           # Authentication Page
├── AdminPage.tsx           # Admin Dashboard
├── map-page-leaflet.tsx    # Map Page
├── property-owners-page.tsx # Property Owners Page
├── analytics-dashboard-page.tsx # Analytics Dashboard
├── arview-page.tsx         # AR View Page
├── audit-logs-page.tsx     # Audit Logs Page
├── automation-rules-page.tsx # Automation Rules Page
├── chat-page.tsx           # Chat Page
├── concierge-page.tsx      # Concierge Page
├── error-dashboard-page.tsx # Error Dashboard Page
├── listings-management-page.tsx # Listings Management
├── maintenance-page.tsx    # Maintenance Page
├── offline-booking.tsx     # Offline Booking Page
├── owner-portal-page.tsx   # Owner Portal Page
├── pricing-engine-page.tsx  # Pricing Engine Page
├── property-tokens-page.tsx # Property Tokens Page
├── tax-reports-page.tsx    # Tax Reports Page
├── privacy-policy-page.tsx # Privacy Policy Page
├── terms-page.tsx          # Terms Page
└── owner-view-page.tsx     # Owner View Page
```

### Backend Layer (`supabase/`)

#### Database Migrations
```
supabase/migrations/
├── 20260526_fix_graphql_exposure.sql # GraphQL Security Fix
└── 20260526_production_security_fixes.sql # Security Fixes
```

#### Edge Functions
```
supabase/functions/
└── v1/
    └── guesty-beapi/       # Guesty Booking Engine API
        └── index.ts        # Edge Function Implementation
```

### Infrastructure Layer

#### DevOps Configuration
```
.github/workflows/
├── ci-cd.yml               # CI/CD Pipeline
└── security-scan.yml       # Security Scanning Pipeline

Dockerfile                  # Multi-stage Docker Build
docker-compose.yml          # Local Development Orchestration
```

#### Configuration Files
```
tsconfig.json               # Root TypeScript Config
tsconfig.app.json          # Application TypeScript Config
tsconfig.node.json          # Node TypeScript Config
vite.config.ts              # Vite Configuration
tailwind.config.js          # Tailwind Configuration
postcss.config.js           # PostCSS Configuration
eslint.config.js            # ESLint Configuration
playwright.config.ts        # Playwright Configuration
```

---

## 🎯 Feature Mapping

### Core Features

#### 1. Content Management System (CMS)
- **Page Builder**: Drag-and-Drop interface for page creation
- **Block System**: Reusable content blocks with themes
- **Theme Engine**: Customizable themes with color/font presets
- **Version Control**: Version history and rollback capabilities
- **SEO Optimization**: Meta tag management and SEO tools
- **Media Library**: Centralized asset management
- **Live Preview**: Real-time preview of page changes

#### 2. Booking Engine
- **Property Search**: Advanced search with filters
- **Property Details**: Rich property information display
- **Quote Generation**: Real-time pricing from Guesty API
- **Checkout Process**: Seamless Stripe integration
- **Payment Processing**: Secure payment handling
- **Booking Confirmation**: Instant confirmation and notifications
- **Guest Management**: Guest information and preferences

#### 3. Guesty Integration
- **Listing Synchronization**: Real-time property listing sync
- **Calendar Management**: Availability calendar integration
- **Pricing Engine**: Dynamic pricing from Guesty
- **Reservation Management**: Booking creation and management
- **Payment Integration**: Stripe-Guesty payment flow
- **Webhook Handling**: Guesty webhook processing
- **Data Consistency**: Atomic operations with idempotency

#### 4. Generative AI Suite
- **Content Generation**: AI-powered content creation
- **Image Generation**: AI-generated property images
- **Chat Assistant**: AI concierge for guest queries
- **Prompt Engineering**: Optimized prompts for quality results
- **Quality Control**: Content filtering and validation
- **Multi-language**: Support for multiple languages

#### 5. Analytics Dashboard
- **Booking Analytics**: Booking statistics and trends
- **Revenue Tracking**: Revenue analysis and forecasting
- **Occupancy Rates**: Property occupancy visualization
- **Performance Metrics**: Key performance indicators
- **Custom Reports**: Customizable reporting tools
- **Real-time Data**: Live dashboard updates

#### 6. Property Management
- **Property Listings**: Comprehensive property management
- **Owner Portal**: Dedicated owner interface
- **Maintenance Requests**: Maintenance tracking
- **Tax Reporting**: Automated tax report generation
- **Contract Management**: Digital contract handling
- **Communication Tools**: Owner-guest communication

#### 7. Admin Features
- **User Management**: Role-based access control
- **System Configuration**: Application settings
- **Audit Logs**: Comprehensive audit trail
- **Error Monitoring**: Error tracking and alerts
- **Automation Rules**: Business rule automation
- **Integration Management**: External service configuration

#### 8. Security Features
- **Authentication**: Secure user authentication
- **Authorization**: Role-based permissions
- **Data Encryption**: Encryption at rest and in transit
- **Security Headers**: OWASP security headers
- **Rate Limiting**: API rate limiting
- **Audit Trail**: Comprehensive security logging

#### 9. Performance Features
- **Caching**: Multi-level caching strategy
- **Connection Pooling**: Database connection optimization
- **Async Processing**: Background job processing
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Optimized bundle loading
- **Lazy Loading**: On-demand component loading

#### 10. Developer Experience
- **Type Safety**: Strict TypeScript configuration
- **Testing**: Comprehensive test coverage
- **Documentation**: Detailed architecture documentation
- **CI/CD**: Automated deployment pipeline
- **Monitoring**: Real-time system monitoring
- **Debugging Tools**: Advanced debugging capabilities

---

## 🔧 Data Flow Architecture

### Booking Flow Data Flow
```
User Search → Properties Query → Property Selection → Quote Request → 
Guesty Pricing → Quote Display → Checkout Initiation → Stripe Payment → 
Booking Creation → Guesty Reservation → Confirmation → Notification
```

### CMS Content Flow
```
Admin Editor → Block Composition → Theme Application → Version Save → 
Preview Generation → Publish → Cache Update → CDN Distribution → 
User Request → Cache Check → Content Delivery → Analytics Tracking
```

### AI Generation Flow
```
User Request → Prompt Engineering → AI API Call → Response Processing → 
Quality Validation → Content Storage → Cache Update → User Display → 
Feedback Collection → Model Optimization
```

---

## 🔄 State Management Architecture

### Global State (Zustand)
- **Authentication Store**: User session and permissions
- **UI State Store**: Modal states, loading states
- **Cache State Store**: Cached data management
- **Theme State Store**: Current theme and preferences

### Component State (React)
- **Form State**: Local form handling
- **UI State**: Component-specific UI state
- **Temporary State**: Ephemeral component state

### Server State (React Query)
- **API Data**: Cached API responses
- **Background Sync**: Automatic data synchronization
- **Optimistic Updates**: Immediate UI updates

---

## 🚀 Deployment Architecture

### Development Environment
- **Local Development**: Docker Compose orchestration
- **Hot Reloading**: Vite HMR for fast development
- **Mock Services**: Local service mocking
- **Debug Tools**: Advanced debugging capabilities

### Staging Environment
- **Production-like**: Mirrors production configuration
- **Integration Testing**: Full integration testing
- **Performance Testing**: Load and stress testing
- **Security Testing**: Security validation

### Production Environment
- **High Availability**: Multi-region deployment
- **Auto-scaling**: Horizontal pod autoscaling
- **Load Balancing**: Application load balancers
- **Disaster Recovery**: Automated backup and recovery

---

## 📊 Monitoring & Observability

### Application Monitoring
- **Performance Metrics**: Response times, throughput
- **Business Metrics**: Booking rates, conversion rates
- **User Metrics**: Active users, session duration
- **Error Metrics**: Error rates, error types

### Infrastructure Monitoring
- **Resource Usage**: CPU, memory, disk usage
- **Network Metrics**: Bandwidth, latency
- **Database Metrics**: Query performance, connection stats
- **Cache Metrics**: Hit rates, cache size

### Security Monitoring
- **Authentication Events**: Login attempts, failures
- **Authorization Events**: Permission denials
- **Data Access**: Sensitive data access logs
- **Threat Detection**: Anomaly detection and alerts

---

**Last Updated**: 2026-05-26  
**Architecture Version**: 2.0.0-enterprise  
**Status**: Production-Ready, Zero-Trust, Hyper-Scalable