import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, persona } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
    }

    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن لا تقل عن 4 خانات' }, { status: 400 })
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
        success: true, 
        message: 'الحساب موجود بالفعل، يمكنك المتابعة لتسجيل الدخول',
        userId: existingUser.id,
        isExisting: true
      })
    }

    // 2. Create new Workspace for this user
    const workspaceDomain = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6)
    const workspace = await db.workspace.create({
      data: {
        name: `مكتب ${cleanName}`,
        domain: workspaceDomain,
      }
    })

    // 3. Create the User record attached to the new Workspace
    const newUser = await db.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        role: role,
        workspaceId: workspace.id,
      }
    })

    // 4. Create initial welcome notification
    await db.notification.create({
      data: {
        userId: newUser.id,
        title: 'مرحباً بك في منصة سَنَد',
        message: 'تم تفعيل مساحة العمل الخاصة بك بنجاح. يمكنك الآن بدء إدارة القضايا وتوليد العقود.',
        link: '/dashboard'
      }
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
