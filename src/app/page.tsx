import { LandingHeader } from './_landing/LandingHeader'
import { HeroSection } from './_landing/HeroSection'
import { InteractiveDemo } from './_landing/InteractiveDemo'
import { ContractSummaryShowcase } from './_landing/ContractSummaryShowcase'
import { HowItWorksSection } from './_landing/HowItWorksSection'
import { TrustLayerSection } from './_landing/TrustLayerSection'
import { TargetAudienceSection } from './_landing/TargetAudienceSection'
import { UnderConstructionSection } from './_landing/UnderConstructionSection'
import { FinalCta } from './_landing/FinalCta'
import { LandingFooter } from './_landing/LandingFooter'
import { ConsentLayer } from './_landing/ConsentLayer'

/**
 * Public landing page for Maqar (مقر):
 * 1. Hero — Digital office & branded client portal for solo Saudi lawyers & small offices (1–10 seats)
 * 2. Free Lead Magnet — Deterministic Saudi contract reading & review checklist assistant (#checker & #summarizer)
 * 3. Workflow, Trust Layer, Target Audience, Roadmap Waitlist, and Trial CTA
 */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans relative overflow-x-hidden text-[#1B281F] selection:bg-[#1F7A46] selection:text-white"
      dir="rtl"
    >
      <LandingHeader />

      <main className="flex-1 relative z-10">
        {/* Section 1: Solo Lawyer & Small Office Hero */}
        <HeroSection />

        {/* Section 2: Free Clause Reading & Checklist Assistant */}
        <InteractiveDemo />

        {/* Section 2B: Contract Structural Summary & Attention Highlights */}
        <ContractSummaryShowcase />

        {/* Section 3: How It Works */}
        <HowItWorksSection />

        {/* Section 4: Truthful Security & Privacy Layer */}
        <TrustLayerSection />

        {/* Section 5: Target Audience (Solo Lawyers & Small Offices) */}
        <TargetAudienceSection />

        {/* Section 6: Phase 2 Roadmap & Early Access Waitlist */}
        <UnderConstructionSection />

        {/* Section 7: Closing Call To Action */}
        <FinalCta />
      </main>

      <LandingFooter />

      <ConsentLayer />
    </div>
  )
}
