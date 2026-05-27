// @ts-nocheck
export { useAuthStore } from './auth';
export type {} from './auth';

export { useUIStore } from './ui';
export type { Notification, NotificationType } from './ui';

export { useBookingsStore } from './bookings';
export type { Reservation, BookingStatus } from './bookings';

export { usePropertiesStore } from './properties';
export type { Property } from './properties';

export { useChatStore } from './chat';
export type { ChatRoom, ChatMessage } from './chat';

export { useAutomationStore } from './automation';
export type { AutomationRule, AutomationTrigger, AutomationAction } from './automation';

export { useMaintenanceStore } from './maintenance';
export type { MaintenanceTicket, TicketStatus, TicketPriority } from './maintenance';

export { usePricingStore } from './pricing';
export type { PricingRule } from './pricing';

export { useMediaStore } from './media';
export type { MediaItem } from './media';

export { useAnalyticsStore } from './analytics';

export { useOwnersStore } from './owners';
export type { Owner, OwnerReport } from './owners';

export { useAuditStore } from './audit';
export type { AuditLog } from './audit';