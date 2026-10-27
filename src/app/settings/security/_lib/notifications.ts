

export type NotificationType = 'system' | 'assignment' | 'workflow' | 'portal' | 'approval' | 'security' | 'reminder'

export const NOTIFICATION_LABELS: Array<{ type: NotificationType; label: string; desc: string }> = [
  { type: 'security', label: 'تنبيهات الأمان والحساب', desc: 'تسجيلات الدخول، تغييرات كلمة المرور، والتحقق الثنائي' },
  { type: 'reminder', label: 'تذكيرات الجلسات والمواعيد', desc: 'مواعيد المحاكم، المهام المستحقة، وانتهاء التراخيص' },
  { type: 'assignment', label: 'إسناد القضايا والمهام', desc: 'عند تكليفك بقضية أو مهمة جديدة داخل المكتب' },
  { type: 'workflow', label: 'تحديثات سير العمل', desc: 'انتقال القضايا بين المراحل وتحديثات الفريق' },
  { type: 'portal', label: 'بوابة الموكل والملفات', desc: 'رفع الموكلين للمستندات أو استفسارات البوابة' },
  { type: 'approval', label: 'طلبات الاعتماد والمراجعة', desc: 'مسودات العقود والمذكرات بانتظار موافقتك' },
  { type: 'system', label: 'إشعارات النظام العامة', desc: 'التحديثات التشغيلية والتنبيهات الإدارية' },
]

export type PrefState = Record<NotificationType, { inApp: boolean; email: boolean }>

export function defaultPrefs(): PrefState {
  return {
    security: { inApp: true, email: true },
    reminder: { inApp: true, email: true },
    assignment: { inApp: true, email: true },
    workflow: { inApp: true, email: true },
    portal: { inApp: true, email: true },
    approval: { inApp: true, email: true },
    system: { inApp: true, email: true },
  }
}
