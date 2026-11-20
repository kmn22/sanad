import { db } from '@/lib/db';
import { logError, logEvent } from '@/lib/observability'

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
      const ok = await deliverToChannel(channel, recipients, payload, workspaceId);
      if (ok) deliveredChannels.push(channel);
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
): Promise<boolean> {
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
      return true;
    }
    case 'sms':
      logEvent('warn', '[notification-bus] sms channel not configured — delivery skipped', {
        workspaceId,
        userIds,
        action: 'notify-sms-skipped',
      });
      return false;
    case 'whatsapp': {
      const apiUrl = process.env.WHATSAPP_BUSINESS_API_URL;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const recipientPhone = typeof payload.metadata?.recipientPhone === 'string' ? payload.metadata.recipientPhone.trim() : '';
      if (!apiUrl || !accessToken || !recipientPhone) {
        logEvent('warn', '[notification-bus] whatsapp channel unconfigured or missing recipientPhone — delivery skipped', {
          workspaceId,
          userIds,
          action: 'notify-whatsapp-skipped',
        });
        return false;
      }
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'text',
          text: { body: `${payload.title}\n${payload.body}${payload.link ? `\n${payload.link}` : ''}` },
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        throw new Error(`WhatsApp Cloud API returned HTTP ${res.status}`);
      }
      return true;
    }
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
