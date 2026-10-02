export const ANALYTICS_EVENTS = {
  SIGNUP: 'signup',
  SANDBOX_DRAFT: 'sandbox_draft',
  PORTAL_OPEN: 'portal_open',
  EXERCISE_GRADED: 'exercise_graded',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ALERT_DELIVERED: 'alert_delivered',
  PAYMENT_SUCCESS: 'payment_success',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

interface AnalyticsEventBase {
  timestamp: string;
}

export interface SignupEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.SIGNUP;
  userId: string;
  workspaceId: string;
  persona?: 'lawyer' | 'student';
  source?: string;
}

export interface SandboxDraftEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.SANDBOX_DRAFT;
  sandboxId: string;
  documentType: string;
  completed: boolean;
}

export interface PortalOpenEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.PORTAL_OPEN;
  portalAccessId: string;
  workspaceId: string;
  clientId: string;
  caseId?: string;
}

export interface ExerciseGradedEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.EXERCISE_GRADED;
  userId: string;
  exerciseId: string;
  score: number;
  passed: boolean;
}

export interface LoginEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.LOGIN;
  userId: string;
  workspaceId: string;
  method: 'credentials' | 'oauth';
}

export interface LogoutEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.LOGOUT;
  userId: string;
  workspaceId: string;
}

export interface OnboardingCompletedEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.ONBOARDING_COMPLETED;
  userId: string;
  workspaceId: string;
  stepsCompleted: string[];
}

export interface AlertDeliveredEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.ALERT_DELIVERED;
  userId: string;
  workspaceId: string;
  alertId: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'in_app';
}

export interface PaymentSuccessEvent extends AnalyticsEventBase {
  event: typeof ANALYTICS_EVENTS.PAYMENT_SUCCESS;
  userId: string;
  workspaceId: string;
  invoiceId: string;
  amount: number;
  method: string;
}

export type AnalyticsEvent =
  | SignupEvent
  | SandboxDraftEvent
  | PortalOpenEvent
  | ExerciseGradedEvent
  | LoginEvent
  | LogoutEvent
  | OnboardingCompletedEvent
  | AlertDeliveredEvent
  | PaymentSuccessEvent;

/**
 * Send an analytics event to the backend ingestion endpoint.
 * Failures are intentionally swallowed so analytics never break
 * the user-facing flow.
 */
export async function trackEvent(event: Omit<AnalyticsEvent, 'timestamp'> & { timestamp?: string }) {
  const payload: AnalyticsEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  } as AnalyticsEvent;

  try {
    if (typeof window !== 'undefined') {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      // Server-side: use absolute URL from env or simply log for now.
      // The endpoint can be called directly in server actions later.
      console.info('[analytics] event', payload.event, payload);
    }
  } catch (error) {
    console.warn('[analytics] failed to send event', error);
  }
}

export function getEventName(event: AnalyticsEvent): AnalyticsEventName {
  return event.event;
}
