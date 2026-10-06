'use client'

import { LawyerSectionView } from '../lawyer/LawyerSectionView'
import { firmHref, type FirmPracticeSection } from './sections'

export function FirmSectionView({ section }: { section: FirmPracticeSection }) {
  return <LawyerSectionView section={section} hrefFor={firmHref} />
}
