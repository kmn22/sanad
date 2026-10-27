'use client'

import { Card } from './Card'
import type { AdminState } from './use-admin'

export function AdminStatusSection({ v }: { v: AdminState }) {
  const { status, requests, users, workspaces, jobs, flags, setFlags, auditLogs, waitlist, feedback, updateFeedback, incidents, setIncidents, registers, incidentTitle, setIncidentTitle, incidentDesc, setIncidentDesc, incidentSeverity, setIncidentSeverity, loadingLogs, email, setEmail, role, setRole, setMessage, lastInviteUrl, loadLogs, invite, testEmail, updateUser, updateWorkspace, updatePrivacyRequest } = v
  return (
    <>
      {status && <>
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <Card title="البريد" value={status.emailConfigured ? 'مهيأ' : 'غير مهيأ'} />
          <Card title="طلبات متأخرة" value={String(status.overduePrivacyRequests)} />
          <Card title="حوادث مفتوحة" value={String(status.openIncidents)} />
          <Card title="النسخ المشفر" value={status.backupEncryptionConfigured ? 'مهيأ' : 'غير مهيأ'} />
          <Card title="الدفع" value={status.billingConfigured ? 'مهيأ' : 'معطل'} />
          <Card title="MFA" value={status.mfaEnabled ? 'مفعّل' : 'مطلوب'} />
          <Card title="مدة التشغيل" value={`${Math.floor((status.uptimeSeconds || 0) / 3600)}س ${Math.floor(((status.uptimeSeconds || 0) % 3600) / 60)}د`} />
          <Card title="مهام فاشلة" value={String(status.failedJobs ?? 0)} />
          <Card title="آخر نسخة احتياطية" value={status.lastBackupAt ? new Date(status.lastBackupAt).toLocaleString('ar-SA') : 'لا يوجد'} />
        </div>

        {flags && <section className="rounded-xl border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">مفاتيح الميزات</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(flags).map(([key, enabled]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border p-3">
                <span dir="ltr" className="text-sm font-mono">{key}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={async (event) => {
                    const response = await fetch('/api/admin/feature-flags', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, enabled: event.target.checked }) })
                    if (response.ok) setFlags((current) => current && { ...current, [key]: event.target.checked })
                    else setMessage('تعذر تحديث المفتاح')
                  }}
                />
              </label>
            ))}
          </div>
        </section>}

        <section className="rounded-xl border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">اختبار البريد</h2>
          <button onClick={testEmail} disabled={!status.emailConfigured} className="rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm text-white disabled:opacity-50">
            إرسال رسالة اختبار إلى بريدي
          </button>
        </section>

        <section className="rounded-xl border p-5 mb-8">
          <h2 className="text-xl font-bold mb-4">دعوة مستخدم جديد</h2>
          <form onSubmit={invite} className="flex flex-wrap gap-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg border p-2.5 text-sm flex-1 min-w-[200px]" placeholder="البريد الإلكتروني" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border p-2.5 text-sm">
              <option value="staff">موظف</option>
              <option value="lawyer">محامٍ</option>
              <option value="student">متدرب</option>
              <option value="auditor">مدقق</option>
            </select>
            <button className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-5 text-sm text-white font-medium">إنشاء الدعوة</button>
          </form>
          {lastInviteUrl && (
            <div className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-left" dir="ltr">
              <code className="text-xs break-all">{lastInviteUrl}</code>
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">المستخدمون والجلسات</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong>{user.name || user.email}</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.email} — {user.role} — MFA: {user.mfaEnabled ? 'مفعّل' : 'غير مفعّل'} {user.disabledAt ? '— (معطل)' : ''}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => updateUser(user.id, { revokeSessions: true })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إنهاء الجلسات</button>
                  <button onClick={() => updateUser(user.id, { mfaReset: true })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إعادة تعيين MFA</button>
                  <button onClick={() => updateUser(user.id, { disabled: !user.disabledAt })} className="rounded-lg border px-3 py-1.5 hover:bg-muted">{user.disabledAt ? 'تفعيل' : 'تعطيل'}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {workspaces && <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">مساحات العمل (المنصة)</h2>
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <strong>{workspace.name}</strong>
                    <p className="text-sm text-muted-foreground">
                      {workspace.type} — {workspace.status} — {workspace.plan?.name || 'بدون باقة'} ({workspace.subscriptionStatus || '—'}) — المالك: {workspace.owner?.email || '—'}
                    </p>
                    {workspace.usage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        مقاعد {workspace.usage.seats}/{workspace.plan?.seatLimit ?? '—'} • تخزين {Math.round((workspace.usage.storage?.usedBytes || 0) / 1048576)}MB • ذكاء {workspace.usage.aiRequests?.used ?? 0}/{workspace.usage.aiRequests?.limit ?? '∞'} • رفعات {workspace.usage.portalUploads?.used ?? 0}/{workspace.usage.portalUploads?.limit ?? '∞'}
                      </p>
                    )}
                    {workspace.suspensionReason && <p className="text-xs text-rose-600 mt-1">سبب الإيقاف: {workspace.suspensionReason}</p>}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {workspace.status === 'active' ? <>
                      <button onClick={() => updateWorkspace(workspace.id, 'suspend')} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إيقاف</button>
                      <button onClick={() => updateWorkspace(workspace.id, 'archive')} className="rounded-lg border px-3 py-1.5 hover:bg-muted">أرشفة</button>
                    </> : <button onClick={() => updateWorkspace(workspace.id, 'reactivate')} className="rounded-lg border px-3 py-1.5 hover:bg-muted">إعادة تفعيل</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>}

        {jobs && <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">قائمة المهام الخلفية</h2>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            {['queued', 'processing', 'completed', 'failed'].map((key) => <Card key={key} title={key} value={String(jobs.counts?.[key] || 0)} />)}
          </div>
          {jobs.stuckProcessing > 0 && <p className="mb-3 text-sm text-rose-600 font-semibold">{jobs.stuckProcessing} مهمة عالقة في المعالجة — تحقق من السجلات.</p>}
          <div className="space-y-1 text-sm">
            {jobs.recent?.slice(0, 10).map((job: any) => (
              <div key={job.id} className="flex flex-wrap justify-between gap-2 rounded-lg border p-2 text-xs">
                <span>{job.type} — {job.status} ({job.attempts}/{job.maxAttempts})</span>
                <span className="text-muted-foreground">{job.lastError || new Date(job.updatedAt || job.createdAt).toLocaleString('ar-SA')}</span>
              </div>
            ))}
          </div>
        </section>}

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">طلبات أصحاب البيانات (PDPPL)</h2>
          {requests.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
              لا توجد طلبات معلقة من أصحاب البيانات حالياً.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-xl border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="text-sm font-semibold">{request.requestType}</strong>
                      <span className="text-xs text-muted-foreground mx-2">•</span>
                      <span className="text-xs font-mono text-muted-foreground">{request.requesterEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        request.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                          : request.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      }`}>
                        {request.status}
                      </span>
                      {request.identityVerified ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                          الهوية موثقة ✓
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          الهوية بانتظار التوثيق
                        </span>
                      )}
                    </div>
                  </div>

                  {request.details && (
                    <p className="text-xs bg-muted/40 p-2.5 rounded-lg text-muted-foreground leading-relaxed">
                      تفاصيل الطلب: {request.details}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t text-xs">
                    <span className="text-muted-foreground">
                      تاريخ الاستحقاق: {new Date(request.dueAt).toLocaleDateString('ar-SA')}
                    </span>
                    <div className="flex items-center gap-2">
                      {!request.identityVerified && (
                        <button
                          onClick={() => updatePrivacyRequest(request.id, { identityVerified: true, status: 'in_progress' })}
                          className="rounded-lg border border-blue-600/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2.5 py-1"
                        >
                          توثيق الهوية
                        </button>
                      )}
                      {request.status !== 'completed' && request.status !== 'rejected' && (
                        <>
                          <button
                            onClick={() => updatePrivacyRequest(request.id, { status: 'completed' })}
                            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 font-medium"
                          >
                            إكمال الطلب
                          </button>
                          <button
                            onClick={() => {
                              const reason = window.prompt('سبب الرفض:')
                              if (reason) updatePrivacyRequest(request.id, { status: 'rejected', rejectionReason: reason })
                            }}
                            className="rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      {request.requestType === 'destruction' && request.identityVerified && request.status !== 'completed' && (
                        <button
                          onClick={() => {
                            if (window.confirm('تحذير: سيتم إتلاف بيانات المستخدم بالكامل وحذف سجلات الرضا والإشعارات نهائياً وفق نظام حماية البيانات الشخصية. هل أنت متأكد؟')) {
                              updatePrivacyRequest(request.id, { executeDestruction: true, status: 'completed' })
                            }
                          }}
                          className="rounded-lg bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-1 font-medium"
                        >
                          تنفيذ الإتلاف النهائي
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-2">حوادث الخصوصية وسجلات الامتثال (PDPL Registers & Breach Log)</h2>
          <p className="text-xs text-muted-foreground mb-4">
            توثيق حوادث البيانات الشخصية (مع حساب مهلة إخطار سدايا 72 ساعة تلقائياً) وسجلات الاحتفاظ والحجز القانوني.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const res = await fetch('/api/admin/privacy/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: incidentTitle, description: incidentDesc, severity: incidentSeverity }),
              })
              if (res.ok) {
                const created = await res.json()
                setIncidents((prev) => [created, ...prev])
                setIncidentTitle('')
                setIncidentDesc('')
                setMessage('تم تسجيل حادث الخصوصية وحساب مهلة إخطار الهيئة (72 ساعة).')
              } else {
                setMessage('تعذر تسجيل الحادث')
              }
            }}
            className="flex flex-wrap gap-2.5 mb-4"
          >
            <input
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
              required
              placeholder="عنوان الحادث الأمني / الخصوصية"
              className="rounded-lg border p-2.5 text-xs flex-1 min-w-[180px]"
            />
            <input
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              required
              placeholder="وصف الحادث والبيانات المتأثرة"
              className="rounded-lg border p-2.5 text-xs flex-1 min-w-[220px]"
            />
            <select
              aria-label="خطورة الحادث"
              value={incidentSeverity}
              onChange={(e) => setIncidentSeverity(e.target.value)}
              className="rounded-lg border p-2.5 text-xs"
            >
              <option value="low">منخفضة</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
              <option value="critical">حرجة</option>
            </select>
            <button className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs text-white font-medium">
              تسجيل حادث
            </button>
          </form>

          {registers && (
            <div className="grid gap-3 sm:grid-cols-4 mb-3">
              <Card title="سجل المعالجين" value={String(registers.processors?.length || 0)} />
              <Card title="تقييمات النقل" value={String(registers.transfers?.length || 0)} />
              <Card title="سياسات الاحتفاظ" value={String(registers.retentionPolicies?.length || 0)} />
              <Card title="الحجز القانوني النشط" value={String(registers.legalHolds?.length || 0)} />
            </div>
          )}

          {incidents.length > 0 && (
            <div className="space-y-1.5">
              {incidents.slice(0, 10).map((inc) => (
                <div key={inc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs">
                  <div>
                    <strong>{inc.title}</strong>
                    <span className="mx-2 text-muted-foreground">({inc.severity})</span>
                    <p className="text-muted-foreground mt-0.5">{inc.description}</p>
                  </div>
                  <span className="font-mono text-[11px] text-amber-800 dark:text-amber-300">
                    مهلة الإخطار: {new Date(inc.authorityDueAt).toLocaleString('ar-SA')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold">قائمة الانتظار المبكرة (Waitlist — {waitlist.length})</h2>
              <p className="text-xs text-muted-foreground mt-0.5">المسجلون في صفحة قيد البناء والصفحة الرئيسية لتجربة المزايا القادمة.</p>
            </div>
            {waitlist.length > 0 && (
              <button
                onClick={() => {
                  const header = 'email,interest,source,createdAt\n'
                  const rows = waitlist
                    .map((w) => `"${w.email.replace(/"/g, '""')}","${(w.interest || '').replace(/"/g, '""')}","${(w.source || '').replace(/"/g, '""')}","${w.createdAt}"`)
                    .join('\n')
                  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `sanad-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted font-medium"
              >
                تصدير CSV
              </button>
            )}
          </div>
          {waitlist.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
              لا توجد تسجيلات في قائمة الانتظار حالياً.
            </div>
          ) : (
            <div className="space-y-1.5">
              {waitlist.slice(0, 30).map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-foreground" dir="ltr">{entry.email}</span>
                    {entry.interest && (
                      <span className="rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-medium">
                        {entry.interest}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {entry.source && <span className="font-mono text-[11px]">{entry.source}</span>}
                    <span>{new Date(entry.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold">ملاحظات النسخة التجريبية (Beta Feedback — {feedback.filter((f) => f.status === 'open').length} مفتوحة)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">بلاغات المشاكل والاقتراحات المرسلة من داخل المنصة عبر زر «ملاحظات Beta».</p>
            </div>
          </div>
          {feedback.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">لا توجد ملاحظات حتى الآن.</div>
          ) : (
            <div className="space-y-2">
              {feedback.slice(0, 50).map((item) => (
                <div key={item.id} className={`rounded-lg border p-3 text-xs space-y-2 ${item.status === 'open' ? 'border-amber-300/70 bg-amber-50/40 dark:bg-amber-950/10' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.type === 'bug' ? 'bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'}`}>
                        {item.type === 'bug' ? 'مشكلة' : item.type === 'suggestion' ? 'اقتراح' : item.type === 'question' ? 'سؤال' : 'أخرى'}
                      </span>
                      <span className="font-semibold">{item.user.name || item.user.email}</span>
                      <span className="text-muted-foreground">· {item.workspace.name}</span>
                      {item.pagePath && <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">{item.pagePath}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{new Date(item.createdAt).toLocaleString('ar-SA')}</span>
                      <select
                        value={item.status}
                        onChange={(e) => updateFeedback(item.id, { status: e.target.value })}
                        className="rounded-md border bg-background px-2 py-1 text-[11px]"
                        aria-label="حالة الملاحظة"
                      >
                        <option value="open">مفتوحة</option>
                        <option value="triaged">قيد المعالجة</option>
                        <option value="resolved">تم الحل</option>
                        <option value="dismissed">مرفوضة</option>
                      </select>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">سجل التدقيق الإداري (Audit Logs)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">تسجيل غير قابل للتعديل لجميع العمليات الحساسة والتغييرات الإدارية.</p>
            </div>
            <button
              onClick={loadLogs}
              disabled={loadingLogs}
              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              {loadingLogs ? 'جارٍ التحديث...' : 'تحديث السجل'}
            </button>
          </div>
          {auditLogs.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
              لا توجد سجلات تدقيق مسجلة حتى الآن.
            </div>
          ) : (
            <div className="space-y-1.5">
              {auditLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-primary">{log.action}</span>
                    {log.entityType && (
                      <span className="text-muted-foreground">
                        ({log.entityType}{log.entityId ? ` #${log.entityId.slice(-6)}` : ''})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {log.ipAddress && <span className="font-mono text-[11px]">{log.ipAddress}</span>}
                    <span>{new Date(log.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>}
    </>
  )
}
