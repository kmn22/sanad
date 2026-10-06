import { notFound } from 'next/navigation'
import { FirmSectionView } from '../FirmSectionView'
import { FIRM_PRACTICE_SECTIONS, isFirmPracticeSection } from '../sections'

export function generateStaticParams() {
  return FIRM_PRACTICE_SECTIONS.map((section) => ({ section }))
}

export const dynamicParams = false

export default async function FirmSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!isFirmPracticeSection(section)) notFound()
  return <FirmSectionView section={section} />
}
