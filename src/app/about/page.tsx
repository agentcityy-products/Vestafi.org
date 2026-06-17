import { AboutCTASection } from '@/components/landing/about-cta-section';
import { AboutFounderSection } from '@/components/landing/about-founder-section';
import { AboutHeroSection } from '@/components/landing/about-hero-section';
import { AboutStorySection } from '@/components/landing/about-story-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNavbar } from '@/components/landing/landing-navbar';

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-background'>
      <LandingNavbar />
      <main>
        <AboutHeroSection />
        <AboutStorySection />
        <AboutFounderSection />
        <AboutCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

