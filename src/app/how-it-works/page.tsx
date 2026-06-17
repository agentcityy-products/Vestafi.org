import { HowItWorksDescriptionSection } from '@/components/landing/how-it-works-description-section';
import { HowItWorksFlowSection } from '@/components/landing/how-it-works-flow-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';

export default function HowItWorksPage() {
  return (
    <div className='min-h-screen bg-background'>
      <LandingNavbar />
      <main>
        <HowItWorksFlowSection />
        <HowItWorksDescriptionSection />
      </main>
      <LandingFooter />
    </div>
  );
}

