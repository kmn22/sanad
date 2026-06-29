import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  await db.dailyBrief.createMany({
    data: [
      {
        title: "تحديث نظام المعاملات المدنية",
        summary: "أعلنت وزارة العدل عن تحديثات جوهرية في اللائحة التنفيذية لنظام المعاملات المدنية تسري ابتداءً من الشهر القادم.",
        source: "MoJ",
        category: "regulation",
      },
      {
        title: "نظام حماية الأجور (تحديث)",
        summary: "إلزام المنشآت الصغيرة التي يقل عدد عامليها عن 5 ببرنامج حماية الأجور (مدد) اعتباراً من الربع الثالث.",
        source: "MHRSD",
        category: "labor",
      },
      {
        title: "تعديل نسبة توطين المهن الهندسية",
        summary: "الموارد البشرية تقر رفع نسبة التوطين في المهن الهندسية إلى 25% كحد أدنى للمنشآت.",
        source: "MHRSD",
        category: "labor",
      },
      {
        title: "منصة نافجز والربط التقني",
        summary: "وزارة العدل توقف استقبال طلبات التنفيذ الورقية وتلزم جميع الشركات بالربط مع منصة ناجز.",
        source: "MoJ",
        category: "regulation",
      }
    ]
  })
  console.log("Seeded Daily Briefs!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
