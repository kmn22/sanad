import { LandingHeader } from './_landing/LandingHeader'
import { HeroSection } from './_landing/HeroSection'
import { InteractiveDemo } from './_landing/InteractiveDemo'
import { ProofMetrics } from './_landing/ProofMetrics'
import { FeatureBento } from './_landing/FeatureBento'
import { PersonaSwitcher } from './_landing/PersonaSwitcher'
import { WhySanad } from './_landing/WhySanad'
import { FaqSection } from './_landing/FaqSection'
import { FinalCta } from './_landing/FinalCta'
import { LandingFooter } from './_landing/LandingFooter'
import { ConsentLayer } from './_landing/ConsentLayer'

/**
 * Public landing page. A Server Component: only the interactive islands
 * (demo, persona switcher, FAQ, consent) ship client JavaScript.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans relative overflow-x-hidden text-slate-100 selection:bg-emerald-500 selection:text-slate-950" dir="rtl">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[70rem] h-[35rem] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[45rem] right-[-10rem] w-[40rem] h-[40rem] bg-emerald-700/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[90rem] left-[-15rem] w-[45rem] h-[45rem] bg-amber-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <LandingHeader />

      <main className="flex-1 relative z-10">
        <HeroSection />

        <InteractiveDemo />

        <ProofMetrics />

        <FeatureBento />

        <PersonaSwitcher />

        <WhySanad />

        <FaqSection />

        <FinalCta />
      </main>

      <LandingFooter />

      <ConsentLayer />
    </div>
  )
}

