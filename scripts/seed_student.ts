// Seed Sanad with Arabic student demo data — law student context
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

async function main() {
  // Clean student tables
  await db.lecture.deleteMany()
  await db.academicDeadline.deleteMany()
  await db.legalTerm.deleteMany()
  await db.caseEntry.deleteMany()
  await db.course.deleteMany()

  // Courses — typical Saudi law school semester
  const courses = [
    { title: 'النظرية العامة للالتزام', code: 'LAW 301', instructor: 'د. عبدالله الشمري', semester: 'الفصل الأول 1447هـ', credits: 4, color: '#0F5132', notes: 'الكتاب: الوسيط للسنهوري' },
    { title: 'القانون الجنائي العام', code: 'LAW 305', instructor: 'د. سعد المطيري', semester: 'الفصل الأول 1447هـ', credits: 3, color: '#b45309', notes: 'مراجعة مواد نظام الإجراءات الجزائية' },
    { title: 'النظم السياسية والدستورية', code: 'LAW 310', instructor: 'د. نورة العتيبي', semester: 'الفصل الأول 1447هـ', credits: 3, color: '#7c3aed', notes: '' },
    { title: 'القانون التجاري', code: 'LAW 320', instructor: 'د. فهد القحطاني', semester: 'الفصل الأول 1447هـ', credits: 3, color: '#0891b2', notes: 'تركيز على نظام الشركات الجديد' },
    { title: 'أصول الفقه الإسلامي', code: 'LAW 340', instructor: 'د. محمد العبيد', semester: 'الفصل الأول 1447هـ', credits: 2, color: '#9333ea', notes: '' },
  ]
  const createdCourses: any[] = []
  for (const c of courses) {
    createdCourses.push(await db.course.create({ data: c }))
  }

  // Lectures — recent ones
  const lectures = [
    { courseId: createdCourses[0].id, title: 'محاضرة 1: مصادر الالتزام', lectureDate: daysFromNow(-14), topic: 'العقد، الإرادة المنفردة، الإثراء بلا سبب', notes: 'الالتزام = رابطة قانونية بين شخصين. المصادر الرئيسية: العقد، شبه العقد، العمل غير المشروع، الإرادة المنفردة. الفرق بين الالتزام بطبيعته والالتزام بمصدره.', status: 'mastered' },
    { courseId: createdCourses[0].id, title: 'محاضرة 2: أركان العقد', lectureDate: daysFromNow(-12), topic: 'الرضا، المحل، السبب', notes: 'الرضا: التطابق بين الإيجاب والقبول. المحل: يجب أن يكون ممكناً ومشروعاً. السبب: الدافع للالتزام.', status: 'reviewed' },
    { courseId: createdCourses[0].id, title: 'محاضرة 3: عيوب الرضا', lectureDate: daysFromNow(-7), topic: 'الغلط، التدليس، الإكراه، الاستغلال', notes: 'الغلط: وقعي أو مانع من الرضا. التدليس: وسيلة احتيال. الإكراه: مادي أو معنوي. الاستغلال: فحاجة وضعف المتعاقد.', status: 'reviewed' },
    { courseId: createdCourses[0].id, title: 'محاضرة 4: انعدام الأهلية وناقصها', lectureDate: daysFromNow(-3), topic: 'الصغير، المجنون، المعتوه', notes: 'الصبي المميز: تصرفه موقوف. المجنون: تصره معدوم. يحتاج مراجعة مواد 80-90 من نظام المعاملات المدنية.', status: 'draft' },
    { courseId: createdCourses[1].id, title: 'محاضرة 1: مبادئ التجريم', lectureDate: daysFromNow(-13), topic: 'مبدأ شرعية الجرائم والعقوبات', notes: 'لا جريمة ولا عقوبة إلا بنص. المصادر: القرآن، السنة، الأنظمة. تطبيق القانون من حيث الزمان والمكان.', status: 'reviewed' },
    { courseId: createdCourses[1].id, title: 'محاضرة 2: أركان الجريمة', lectureDate: daysFromNow(-9), topic: 'الركن الشرعي، المادي، الأدبي', notes: 'الركن الشرعي: نص تجريم. الركن المادي: سلوك + نتيجة + علاقة سببية. الركن الأدبي: القصد الجنائي أو الخطأ.', status: 'reviewed' },
    { courseId: createdCourses[1].id, title: 'محاضرة 3: القصد الجنائي', lectureDate: daysFromNow(-5), topic: 'القصد العام والخاص، القصد المباشر وغير المباشر', notes: 'القصد العام: علم وإرادة. القصد الخاص: نية خاصة كنية القتل. الفرق بين العمد والخطأ.', status: 'draft' },
    { courseId: createdCourses[2].id, title: 'محاضرة 1: مصادر النظام الأساسي للحكم', lectureDate: daysFromNow(-11), topic: 'القرآن، السنة، النظام الأساسي', notes: 'النظام الأساسي لعام 1412هـ. مبادئ الحكم: العدل، الشورى، المساواة. السلطة الثلاث: التنظيمية، التنفيذية، القضائية.', status: 'reviewed' },
    { courseId: createdCourses[3].id, title: 'محاضرة 1: التاجر وأهليته', lectureDate: daysFromNow(-10), topic: 'تعريف التاجر، الشروط، القيد في السجل التجاري', notes: 'التاجر: كل من احترف القيام بأعمال تجارية. الأهلية: 18 سنة. القيد في السجل التجاري إلزامي.', status: 'draft' },
    { courseId: createdCourses[4].id, title: 'محاضرة 1: تعريف الفقه وأصوله', lectureDate: daysFromNow(-8), topic: 'الفرق بين الفقه والأصول، أدلة الأحكام', notes: 'الفقه: الأحكام العملية. الأصول: قواعد استنباط الأحكام. الأدلة: الكتاب، السنة، الإجماع، القياس.', status: 'reviewed' },
  ]
  for (const l of lectures) {
    await db.lecture.create({ data: l })
  }

  // Academic deadlines
  const deadlines = [
    { courseId: createdCourses[0].id, title: 'تسليم بحث الالتزامات', type: 'assignment', dueDate: daysFromNow(5), status: 'in_progress', priority: 'high', weight: 25, notes: 'موضوع: آثار الإكراه على العقد. 15 صفحة.' },
    { courseId: createdCourses[1].id, title: 'اختبار منتصف الفصل — الجنائي', type: 'exam', dueDate: daysFromNow(12), status: 'todo', priority: 'urgent', weight: 30, notes: 'المواد 1-50 من نظام الإجراءات الجزائية' },
    { courseId: createdCourses[2].id, title: 'مناقشة النظام الأساسي', type: 'presentation', dueDate: daysFromNow(8), status: 'todo', priority: 'high', weight: 15, notes: 'عرض 15 دقيقة عن فصل السلطات' },
    { courseId: createdCourses[3].id, title: 'مذكرات مناقشة قضائية', type: 'mooting', dueDate: daysFromNow(20), status: 'todo', priority: 'normal', weight: 20, notes: 'قضية تجارية — التحضير مع الفريق' },
    { courseId: createdCourses[0].id, title: 'اختبار نهائي — الالتزامات', type: 'exam', dueDate: daysFromNow(35), status: 'todo', priority: 'urgent', weight: 40, notes: 'شامل كامل المقرر' },
    { courseId: createdCourses[4].id, title: 'تسليم ملخص أصول الفقه', type: 'assignment', dueDate: daysFromNow(2), status: 'todo', priority: 'high', weight: 30, notes: 'ملخص الفصل الأول' },
    { courseId: createdCourses[3].id, title: 'بحث الشركات', type: 'assignment', dueDate: daysFromNow(18), status: 'todo', priority: 'normal', weight: 25, notes: 'مقارنة بين شركات الأشخاص والأموال' },
    { courseId: null, title: 'التسجيل للفصل القادم', type: 'registration', dueDate: daysFromNow(25), status: 'todo', priority: 'normal', weight: null, notes: 'فتح بوابة التسجيل' },
  ]
  for (const d of deadlines) {
    await db.academicDeadline.create({ data: d })
  }

  // Legal terms — vocabulary student is building
  const terms = [
    { term: 'الالتزام', definition: 'رابطة قانونية بين دائن ومدين بموجبها يلتزم المدين بأداء معين للدائن.', category: 'civil', origin: 'القانون المدني السعودي', example: 'التزام المشتري بدفع الثمن.', mastery: 'mastered' },
    { term: 'الإثراء بلا سبب', definition: 'كسب مالي بلا سبب قانوني على حساب شخص آخر، يلتزم المثري برد ما أثرى به.', category: 'civil', origin: 'القانون المدني', example: 'دفع مبلغ بالخطأ لشخص آخر.', mastery: 'familiar' },
    { term: 'القصد الجنائي', definition: 'علم الجاني بارتكابه الفعل وتوقع نتيجته وإرادته تحقيقها.', category: 'criminal', origin: 'النظام الجنائي', example: 'إطلاق النار بقصد القتل.', mastery: 'familiar' },
    { term: 'العقد الفاسخ', definition: 'عقد تخلف فيه ركن من أركانه أو شروط صحته، فلا ينتج أي أثر قانوني.', category: 'civil', origin: 'القانون المدني', example: 'عقد بيع وقع من مجنون.', mastery: 'learning' },
    { term: 'المحل', definition: 'الشيء الذي يرد عليه الالتزام، يجب أن يكون ممكناً ومشروعاً ومعين أو قابل للتعيين.', category: 'civil', origin: 'القانون المدني', example: 'بيع سيارة محددة.', mastery: 'mastered' },
    { term: 'مبدأ شرعية الجرائم', definition: 'لا جريمة ولا عقوبة إلا بنص، مما يحمي الأفراد من تعسف السلطة.', category: 'criminal', origin: 'النظام الأساسي للحكم، م26', example: 'لا يمكن معاقبة فعل لم ينص القانون على تجريمه وقت ارتكابه.', mastery: 'mastered' },
    { term: 'الإكراه', definition: 'إجبار شخص على إرادة لا يرضاها، يؤثر على صحة العقد.', category: 'civil', origin: 'القانون المدني', example: 'تهديد بالقتل لإجبار على البيع.', mastery: 'familiar' },
    { term: 'التصرف الناقص الأهلية', definition: 'تصرف الصبي المميز، موقوف على إجازة الولي.', category: 'civil', origin: 'نظام المعاملات المدنية', example: 'هبة الصبي المميز.', mastery: 'learning' },
    { term: 'الدفع', definition: 'وسيلة دفاع يقدمها المدعى عليه لرد دعوى المدعي.', category: 'procedural', origin: 'نظام المرافعات الشرعية', example: 'الدفع بالمرور الزمني.', mastery: 'learning' },
    { term: 'التاجر', definition: 'كل من احترف القيام بأعمال تجارية باسمه ولحسابه.', category: 'commercial', origin: 'نظام الشركات', example: 'صاحب محل تجزئة مسجل تجارياً.', mastery: 'familiar' },
    { term: 'الشورى', definition: 'مبدأ إسلامي ودستوري يقضي بوجوب تبادل الرأي في الأمور العامة.', category: 'constitutional', origin: 'النظام الأساسي للحكم', example: 'مجلس الشورى.', mastery: 'familiar' },
    { term: 'الإجماع', definition: 'اتفاق فقهاء الأمة على حكم شرعي في عصر بعد وفاة النبي ﷺ.', category: 'general', origin: 'أصول الفقه', example: 'إجماع الصحابة على جمع القرآن.', mastery: 'learning' },
    { term: 'عقد البيع', definition: 'مبادلة مال بمال، يتم بأن يبيع أحد المتعاقدين للآخر شيئاً بثمن.', category: 'commercial', origin: 'القانون المدني', example: 'بيع سيارة بمبلغ 50,000 ريال.', mastery: 'mastered' },
    { term: 'القضاء', definition: 'السلطة التي تتولى الفصل في المنازعات بإصدار أحكام قضائية.', category: 'constitutional', origin: 'النظام القضائي', example: 'محكمة الاستئناف.', mastery: 'familiar' },
    { term: 'الحجر', definition: 'منع الشخص من التصرف في ماله لحمايته أو حماية الغير.', category: 'civil', origin: 'نظام المعاملات المدنية', example: 'الحجر على الصغير والمجنون.', mastery: 'learning' },
  ]
  for (const t of terms) {
    await db.legalTerm.create({ data: t })
  }

  // Casebook — landmark cases / principles
  const cases = [
    { caseName: 'قضية الدوسري ضد شركة الأمل التجارية', citation: '1442/غ/1234', court: 'محكمة الاستئناف بالرياض', principle: 'بطلان العقد لتخلف ركن المحل: لا يصح البيع إذا كان المبيع غير معين أو غير قابل للتعيين وقت العقد.', subject: 'civil', summary: 'باعت الشركة سيارة لم تحدد مواصفاتها بدقة، طلب المشتري إبطال العقد لعدم تعيين المحل. قضت المحكمة ببطلان العقد.', significance: 'تطبيق صريح لركن المحل وتأكيد أن التعيين الجوهري شرط صحة.', rating: 5 },
    { caseName: 'النيابة العامة ضد المطيري', citation: '1441/ج/567', court: 'الديوان العام للمظالم', principle: 'لا عقوبة إلا بنص: تطبيق مبدأ الشرعية الجنائية بشكل صارم.', subject: 'criminal', summary: 'اتُّهم المتهم بفعل لم يكن مجرّماً وقت ارتكابه. قضت المحكمة برفض الدعوى لتطبيق القانون بأثر رجعي.', significance: 'تثبيت مبدأ عدم رجعية القانون الجنائي.', rating: 5 },
    { caseName: 'قضية إثراء بلا سبب — مؤسسة النور', citation: '1440/تج/890', court: 'محكمة الاستئناف بجدة', principle: 'من أثرى دون سبب مشروع على حساب آخر يلتزم بالرد.', subject: 'civil', summary: 'حولت المؤسسة مبلغاً بالخطأ إلى حساب المدعى عليه الذي رفض رده. قضت المحكمة بإلزامه بالرد.', significance: 'تطبيق نظرية الإثراء بلا سبب ومحاربة الثراء غير المشروع.', rating: 4 },
    { caseName: 'قضية القصد الجنائي — السرقة', citation: '1443/ج/2103', court: 'المحكمة الجزائية بالرياض', principle: 'يتطلب ثبوت السرقة قصد الجنائي خاص: نية أخذ المال على وجه الاحتيال.', subject: 'criminal', summary: 'أخذ المتهم مبلغاً ظناً منه أنه ماله. قضت المحكمة بالبراءة لانتفاء القصد الخاص.', significance: 'تمييز دقيق بين القصد العام والقصد الخاص في السرقات.', rating: 4 },
    { caseName: 'دعوى بطلان توقيع', citation: '1444/مدن/445', court: 'محكمة الاستئناف بالدمام', principle: 'الإكراه المعنوي يبطل الرضا ولو لم يصل لدرجة الإكراه المادي.', subject: 'civil', summary: 'وقّع المدعي عقداً تحت ضغط التهديد بفضيحة. قضت المحكمة بإبطال العقد للإكراه المعنوي.', significance: 'توسيع مفهوم الإكراه ليشمل الضغوط النفسية.', rating: 4 },
    { caseName: 'منازعة تجارية — الشركات', citation: '1442/تج/777', court: 'محكمة الاستئناف التجارية بالرياض', principle: 'لا يعتد بالتزامن في الشركة المساهمة إلا بعد القيد في السجل التجاري.', subject: 'commercial', summary: 'نازع شريك في صحة توقيعه قبل القيد. قضت المحكمة بعدم قبول الدعوى.', significance: 'تطبيق مبدأ الشهر التجاري وحماية الغير حسن النية.', rating: 3 },
  ]
  for (const c of cases) {
    await db.caseEntry.create({ data: c })
  }

  console.log('Student seed complete (Arabic)')
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
