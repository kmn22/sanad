import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { rateLimit } from '@/lib/rate-limit'

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const { success } = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)
    if (!success) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, password, persona } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن لا تقل عن 6 خانات' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name?.trim() || cleanEmail.split('@')[0]
    const role = persona === 'student' ? 'student' : 'lawyer'

    // 1. Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.'
      }, { status: 409 })
    }

    // 2. Hash password cryptographically
    const hashedPassword = hashPassword(password)

    // Keep account creation atomic so a failed signup cannot leave orphaned data.
    const { workspace, newUser } = await db.$transaction(async (tx) => {
      const workspaceDomain = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6)
      const workspace = await tx.workspace.create({
        data: {
          name: `مكتب ${cleanName}`,
          domain: workspaceDomain,
        }
      })

      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          password: hashedPassword,
          role,
          workspaceId: workspace.id,
        }
      })

      await tx.notification.create({
        data: {
          userId: newUser.id,
          title: 'مرحباً بك في منصة سَنَد',
          message: 'تم تفعيل مساحة العمل الخاصة بك بنجاح. يمكنك الآن بدء إدارة القضايا وتوليد العقود.',
          link: '/dashboard'
        }
      })

      const now = new Date()
      const in180 = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
      const in15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      const past180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Seed starter compliance items with user's actual firm name
      await tx.complianceItem.createMany({
        data: [
          {
            title: 'السجل التجاري للمنشأة',
            category: 'cr',
            entityName: `مكتب ${cleanName}`,
            issueDate: past180,
            expiryDate: in180,
            status: 'active',
            notes: 'تجديد سنوي عبر المركز السعودي للأعمال',
            notifyDays: 30,
            workspaceId: workspace.id,
          },
          {
            title: 'اشتراك التأمينات الاجتماعية (GOSI)',
            category: 'gosi',
            entityName: `مكتب ${cleanName}`,
            issueDate: past30,
            expiryDate: in15,
            status: 'expiring',
            notes: 'سداد الاشتراك الشهري عبر نظام سداد',
            notifyDays: 15,
            workspaceId: workspace.id,
          },
        ]
      })

      // Seed initial client and case for the new workspace
      const starterClient = await tx.client.create({
        data: {
          name: 'شركة التطوير الرقمي الحديثة',
          type: 'corporate',
          company: 'شركة التطوير الرقمي الحديثة',
          phone: '+966500000000',
          email: `client@${workspaceDomain}.sa`,
          address: 'الرياض — طريق الملك فهد',
          notes: 'عميل جديد — مسجل عبر المنصة',
          workspaceId: workspace.id,
        }
      })

      await tx.legalCase.create({
        data: {
          title: 'إعداد ومراجعة اتفاقية توريد وتراخيص برمجية',
          clientId: starterClient.id,
          clientName: starterClient.name,
          caseType: 'contract',
          stage: 'drafting',
          priority: 'high',
          value: 15000,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          notes: 'مراجعة شروط عدم الإفصاح والملكية الفكرية وفق الأنظمة السعودية',
          workspaceId: workspace.id,
        }
      })

      await tx.task.create({
        data: {
          title: 'استكمال إعداد بيانات المنشأة وبدء صياغة أول مستند',
          status: 'todo',
          priority: 'high',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          workspaceId: workspace.id,
        }
      })

      return { workspace, newUser }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب ومساحة العمل بنجاح',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        workspaceId: workspace.id
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      error: 'تعذر إتمام التسجيل في الوقت الحالي. يرجى المحاولة لاحقاً.' 
    }, { status: 500 })
  }
}
