import { CallToActionSection } from '@/components/landing/call-to-action-section';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { ProcessSection } from '@/components/landing/process-section';
import { RevolutionSection } from '@/components/landing/revolution-section';
import { TheUnsaidTruthSection } from '@/components/landing/the-unsaid-truth-section';
import { WhyApplySection } from '@/components/landing/why-apply-section';
import { WhyNowSection } from '@/components/landing/why-now-section';

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <LandingNavbar isInHomePage />
      <main>
        <HeroSection />
        <RevolutionSection />
        <TheUnsaidTruthSection />
        <WhyApplySection />
        <WhyNowSection />

        <CallToActionSection />
        <ProcessSection />
        {/* <FractionalOwnershipSection /> */}
      </main>
      <LandingFooter />
    </div>
  );
}
