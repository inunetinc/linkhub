import Navbar from './home/Navbar';
import HeroSection from './home/HeroSection';
import PlatformsSection from './home/PlatformSection'
import StatsSection from './home/StatsSection';
import HowItWorksSection from './home/HowItWorksSection';
import FeaturesSection from './home/FeaturesSection';
import WhyChooseUsSection from './home/WhyChooseUsSection';
import CreatorsShowcase from './home/CreatorShowcase';
import Footer from './home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <PlatformsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WhyChooseUsSection />
      <CreatorsShowcase />
      <Footer />
    </div>
  );
}
