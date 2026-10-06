import { notFound } from 'next/navigation'
import { LawyerSectionView } from '../LawyerSectionView'
import { isLawyerSection, LAWYER_SECTIONS } from '../sections'

export function generateStaticParams() {
  return LAWYER_SECTIONS.map((section) => ({ section }))
}

export const dynamicParams = false

export default async function LawyerSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!isLawyerSection(section)) notFound()
  return <LawyerSectionView section={section} />
}
