'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Copy, Gavel, Mail, ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLang } from '@/lib/sanad/i18n'
import { PortalPageHeader, StatTile, useBilingual } from '@/components/portal/PortalShell'
import { FirmLoading } from './shared'
import { ROLE_LABELS } from './shared'
import { useFirm } from './shared'
import { Panel } from './shared'

export const INVITE_ROLES = ['lawyer', 'staff', 'student', 'auditor'] as const

export function FirmTeamPage() {
  const { lang } = useLang()
  const L = useBilingual()
  const { data, isLoading, refetch } = useFirm()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof INVITE_ROLES)[number]>('lawyer')
  const [sending, setSending] = useState(false)
  const [lastUrl, setLastUrl] = useState('')

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      setLastUrl(json.url || '')
      setEmail('')
      toast.success(json.delivery === 'email' ? L({ ar: 'أُرسلت الدعوة بالبريد', en: 'Invitation emailed' }) : L({ ar: 'أُنشئ رابط الدعوة — انسخه وأرسله', en: 'Invite link created — copy and share it' }))
      refetch()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  async function revokeInvitation(id: string) {
    const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(json.error || L({ ar: 'تعذر إلغاء الدعوة', en: 'Could not revoke invitation' }))
      return
    }
    toast.success(L({ ar: 'أُلغيت الدعوة', en: 'Invitation revoked' }))
    refetch()
  }

  if (isLoading && !data) return <FirmLoading />
  if (!data) return null

  return (
    <>
      <PortalPageHeader portal="firm" title={L({ ar: 'الفريق والدعوات', en: 'Team & invitations' })} subtitle={L({ ar: 'أضف محامين وموظفين وحدد صلاحياتهم', en: 'Add lawyers and staff and set their roles' })} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={L({ ar: 'أعضاء المكتب', en: 'Firm members' })} value={data.members.length} icon={UsersRound} />
        <StatTile label={L({ ar: 'محامون', en: 'Lawyers' })} value={data.members.filter((member) => ['lawyer', 'workspace_owner', 'admin'].includes(member.role)).length} icon={Gavel} />
        <StatTile label={L({ ar: 'MFA مفعّل', en: 'MFA enabled' })} value={`${data.members.filter((member) => member.mfaEnabled).length}/${data.members.length}`} icon={ShieldCheck} tone={data.members.every((member) => member.mfaEnabled) ? 'good' : 'warn'} />
        <StatTile label={L({ ar: 'دعوات معلّقة', en: 'Pending invites' })} value={data.invitations.length} icon={Mail} tone={data.invitations.length ? 'warn' : 'default'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title={L({ ar: `أعضاء المكتب (${data.members.length})`, en: `Firm members (${data.members.length})` })} icon={UsersRound} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground text-start border-b border-border/60">
                  <th className="text-start py-2 font-medium">{L({ ar: 'العضو', en: 'Member' })}</th>
                  <th className="text-start py-2 font-medium">{L({ ar: 'الدور', en: 'Role' })}</th>
                  <th className="text-start py-2 font-medium">{L({ ar: 'القضايا', en: 'Cases' })}</th>
                  <th className="text-start py-2 font-medium">MFA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <p className="font-medium">{m.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </td>
                    <td className="py-2.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">{L(ROLE_LABELS[m.role] || { ar: m.role, en: m.role })}</span>
                    </td>
                    <td className="py-2.5 tabular-nums">
                      {m.activeCases}
                      {m.leadCases > 0 && <span className="text-xs text-muted-foreground"> ({m.leadCases} {L({ ar: 'رئيسي', en: 'lead' })})</span>}
                    </td>
                    <td className="py-2.5">
                      {m.mfaEnabled ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <span className="text-xs text-rose-700 dark:text-rose-400">{L({ ar: 'غير مفعّل', en: 'Off' })}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {L({ ar: 'لتعطيل حساب أو فرض إعادة الدخول استخدم ', en: 'To disable accounts or force sign-out use ' })}
            <Link href="/admin" className="underline">{L({ ar: 'لوحة الإدارة', en: 'the admin console' })}</Link>.
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title={L({ ar: 'دعوة عضو جديد', en: 'Invite a member' })} icon={UserPlus}>
            <form onSubmit={invite} className="space-y-3">
              <Input id="firm-invite-email" type="email" required placeholder="name@lawfirm.sa" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="grid grid-cols-2 gap-1.5">
                {INVITE_ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    id={`firm-invite-role-${r}`}
                    onClick={() => setRole(r)}
                    className={`text-xs py-1.5 rounded-lg border transition-all ${role === r ? 'bg-amber-700 text-white border-amber-700' : 'border-border hover:bg-muted'}`}
                  >
                    {L(ROLE_LABELS[r])}
                  </button>
                ))}
              </div>
              <Button type="submit" disabled={sending} className="w-full bg-amber-700 hover:bg-amber-600 text-white" id="firm-invite-submit">
                {sending ? L({ ar: 'جارٍ الإرسال...', en: 'Sending...' }) : L({ ar: 'إرسال الدعوة', en: 'Send invitation' })}
              </Button>
              {lastUrl && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(lastUrl).then(() => toast.success(L({ ar: 'نُسخ الرابط', en: 'Link copied' })))}
                  className="w-full flex items-center gap-2 text-[11px] text-start p-2 rounded-lg bg-muted/60 hover:bg-muted break-all"
                >
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2" dir="ltr">{lastUrl}</span>
                </button>
              )}
            </form>
          </Panel>

          <Panel title={L({ ar: 'دعوات معلّقة', en: 'Pending invitations' })} icon={Mail}>
            {data.invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground">{L({ ar: 'لا توجد دعوات معلّقة.', en: 'No pending invitations.' })}</p>
            ) : (
              <ul className="space-y-2">
                {data.invitations.map((i) => (
                  <li key={i.id} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate" dir="ltr">{i.email}</span>
                    <span className="text-muted-foreground shrink-0">
                      {L(ROLE_LABELS[i.role] || { ar: i.role === 'client' ? 'موكّل' : i.role, en: i.role })} · {new Date(i.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB')}
                    </span>
                    <button type="button" onClick={() => revokeInvitation(i.id)} className="text-rose-600 hover:underline shrink-0">
                      {L({ ar: 'إلغاء', en: 'Revoke' })}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────── Assignments ─────────────────────────── */
