import { db } from '@/lib/db';
import { logError } from '@/lib/observability'

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, unknown>;
}

const DEFAULT_CHANNELS: NotificationChannel[] = ['in_app'];

/**
 * Publish a notification to many users.
 * By default only creates an in-app notification row for each user.
 * Additional channels are executed after the in-app write and before returning.
 */
export async function publishNotification(
  workspaceId: string,
  userIds: string | string[],
  payload: NotificationPayload
): Promise<{ deliveredCount: number; inAppCount: number }> {
  const recipients = Array.isArray(userIds) ? userIds : [userIds];
  const channels = payload.channels ?? DEFAULT_CHANNELS;

  let inAppCount = 0;
  const deliveredChannels: NotificationChannel[] = [];

  if (channels.includes('in_app')) {
    const prefs = await db.notificationPreference.findMany({
      where: { userId: { in: recipients }, type: payload.type, inApp: false },
      select: { userId: true },
    });
    const optedOut = new Set(prefs.map((pref) => pref.userId));
    const inAppRecipients = recipients.filter((userId) => !optedOut.has(userId));
    const rows = await db.notification.createMany({
      data: inAppRecipients.map((userId) => ({
        workspaceId,
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.body,
        link: payload.link,
        entityType: payload.entityType,
        entityId: payload.entityId,
      })),
    });
    inAppCount = rows.count;
    deliveredChannels.push('in_app');
  }

  for (const channel of channels) {
    if (channel === 'in_app') continue;
    try {
      await deliverToChannel(channel, recipients, payload, workspaceId);
      deliveredChannels.push(channel);
    } catch (error) {
      logError(error, { workspaceId, userIds: recipients, msg: `[notification-bus] failed to deliver via ${channel}`, action: 'notify-deliver' });
    }
  }

  return {
    deliveredCount: recipients.length * deliveredChannels.length,
    inAppCount,
  };
}

async function deliverToChannel(
  channel: Exclude<NotificationChannel, 'in_app'>,
  userIds: string[],
  payload: NotificationPayload,
  workspaceId: string
): Promise<void> {
  switch (channel) {
    case 'email': {
      const { enqueueJob } = await import('@/lib/jobs');
      await enqueueJob('notification.email', {
        userIds,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        link: payload.link,
      }, { workspaceId });
      break;
    }
    case 'sms':
      console.log(`[notification-bus] sms channel: ${payload.title}`, {
        workspaceId,
        userIds,
        payload,
      });
      break;
    case 'whatsapp':
      console.log(`[notification-bus] whatsapp channel: ${payload.title}`, {
        workspaceId,
        userIds,
        payload,
      });
      break;
    default:
      throw new Error(`Unsupported notification channel: ${channel}`);
  }
}

export async function sendEmailNotification(
  workspaceId: string,
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  await deliverToChannel('email', userIds, payload, workspaceId);
}

export async function sendSmsNotification(
  workspaceId: string,
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  await deliverToChannel('sms', userIds, payload, workspaceId);
}

export async function sendWhatsAppNotification(
  workspaceId: string,
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  await deliverToChannel('whatsapp', userIds, payload, workspaceId);
}
