import Hero from '../components/home/Hero';
import AccountabilitySection from '../components/home/AccountabilitySection';
import SolutionLoop from '../components/home/SolutionLoop';
import EmployeeInsights from '../components/home/EmployeeInsights';
import ROI from '../components/home/ROI';
import Pricing from '../components/home/Pricing';

const HomePage = () => {
  return (
    <>
      <Hero />
      <AccountabilitySection />
      <SolutionLoop />
      <EmployeeInsights />
      <ROI />
      <Pricing />
    </>
  );
};

export default HomePage;
