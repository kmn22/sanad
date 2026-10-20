import { LandingHeader } from './_landing/LandingHeader'
import { HeroSection } from './_landing/HeroSection'
import { InteractiveDemo } from './_landing/InteractiveDemo'
import { ContractSummaryShowcase } from './_landing/ContractSummaryShowcase'
import { HowItWorksSection } from './_landing/HowItWorksSection'
import { CoveredStatutesSection } from './_landing/CoveredStatutesSection'
import { TrustLayerSection } from './_landing/TrustLayerSection'
import { TargetAudienceSection } from './_landing/TargetAudienceSection'
import { UnderConstructionSection } from './_landing/UnderConstructionSection'
import { FinalCta } from './_landing/FinalCta'
import { LandingFooter } from './_landing/LandingFooter'
import { ConsentLayer } from './_landing/ConsentLayer'

/**
 * Public landing page implementing the approved 8-section repositioning plan:
 * 1. الإسفين — الهيرو
 * 2. العرض الحي المدمج (المصحح)
 * 3. كيف يعمل
 * 4. الأنظمة المغطاة
 * 5. طبقة الثقة
 * 6. لمن هذه المنصة
 * 7. قيد البناء (قائمة الانتظار)
 * 8. الختام والإجراء
 */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans relative overflow-x-hidden text-[#1B281F] selection:bg-[#1F7A46] selection:text-white"
      dir="rtl"
    >
      <LandingHeader />

      <main className="flex-1 relative z-10">
        {/* Section 1: The Wedge Hero */}
        <HeroSection />

        {/* Section 2: Embedded Live Clause Checker */}
        <InteractiveDemo />

        {/* Section 2B: Full Contract Summarizer & 6-Point Risk Breakdown */}
        <ContractSummaryShowcase />

        {/* Section 3: How It Works */}
        <HowItWorksSection />

        {/* Section 4: Covered Saudi Statutes */}
        <CoveredStatutesSection />

        {/* Section 5: Institutional Trust Layer */}
        <TrustLayerSection />

        {/* Section 6: Target Audience */}
        <TargetAudienceSection />

        {/* Section 7: Under Construction Pipeline (Waitlist) */}
        <UnderConstructionSection />

        {/* Section 8: Closing Call To Action */}
        <FinalCta />
      </main>

      <LandingFooter />

      <ConsentLayer />
    </div>
  )
}
