import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext } from '@/lib/auth/workspace'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { userId, workspaceId } = auth
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false

      req.signal.addEventListener('abort', () => {
        isClosed = true
        try {
          controller.close()
        } catch {}
      })

      // Helper to push SSE event
      const sendEvent = (event: string, data: unknown) => {
        if (isClosed) return
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(payload))
        } catch {
          isClosed = true
        }
      }

      // Initial ping
      sendEvent('connected', { time: new Date().toISOString() })

      // Send initial notifications
      try {
        const initial = await db.notification.findMany({
          where: { userId, workspaceId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
        const unreadCount = await db.notification.count({
          where: { userId, workspaceId, isRead: false },
        })
        sendEvent('sync', { notifications: initial, unreadCount })
      } catch (err) {
        console.error('SSE initial notification query failed:', err)
      }

      // Polling loop inside stream (every 6 seconds)
      let lastChecked = new Date()
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval)
          return
        }

        try {
          // Check for any newly created notifications since last check
          const newNotifications = await db.notification.findMany({
            where: {
              userId,
              workspaceId,
              createdAt: { gt: lastChecked },
            },
            orderBy: { createdAt: 'desc' },
          })

          lastChecked = new Date()

          if (newNotifications.length > 0) {
            const unreadCount = await db.notification.count({
              where: { userId, workspaceId, isRead: false },
            })
            sendEvent('new', {
              notifications: newNotifications,
              unreadCount,
            })
          } else {
            // Heartbeat
            sendEvent('ping', { time: Date.now() })
          }
        } catch (err) {
          if (!isClosed) {
            console.error('SSE polling loop error:', err)
          }
        }
      }, 6000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
      })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering on Nginx/Cloudflare
    },
  })
}
