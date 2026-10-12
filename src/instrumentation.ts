import { logError } from '@/lib/observability'
/**
 * Server startup hook — runs once per Node.js server instance.
 *
 * Starts the in-process background-job runner so queued work (transactional
 * emails, reminder sweeps, retention jobs) executes even when no external
 * cron caller is configured. The interval is unref'd so it never keeps the
 * process alive, and a global guard prevents duplicate runners under dev
 * hot-reload.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const globalState = globalThis as { __sanadJobRunner?: ReturnType<typeof setInterval> }
  if (globalState.__sanadJobRunner) return

  const { processDueJobs } = await import('@/lib/jobs')
  const tick = () => {
    processDueJobs().catch((error) => {
      logError(error, { msg: '[jobs] scheduled sweep failed', action: 'job-sweep' })
    })
  }

  globalState.__sanadJobRunner = setInterval(tick, 60_000)
  globalState.__sanadJobRunner.unref?.()
  const firstRun = setTimeout(tick, 15_000)
  firstRun.unref?.()
}
