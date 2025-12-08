import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIHelpBot from './components/AIHelpBot';

// Marketing Pages
import HomePage from './pages/HomePage';
import ProblemPage from './pages/ProblemPage';
import SolutionPage from './pages/SolutionPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import DemoPage from './pages/DemoPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import FAQPage from './pages/FAQPage';
import BlogPage from './pages/BlogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Auth Pages
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

// Sign-Up Flow Pages
import ProfilePage from './pages/signup/ProfilePage';
import RestaurantsPage from './pages/signup/RestaurantsPage';
import PlanPage from './pages/signup/PlanPage';
import PaymentPage from './pages/signup/PaymentPage';
import CompletePage from './pages/signup/CompletePage';

// Account Portal Pages
import AccountDashboardPage from './pages/account/DashboardPage';
import AccountRestaurantsPage from './pages/account/RestaurantsPage';
import AccountSubscriptionPage from './pages/account/SubscriptionPage';
import AccountReferralsPage from './pages/account/ReferralsPage';

function App() {
  const location = useLocation();

  // Pages that don't show navbar/footer (auth, signup, and account flows)
  const isAuthPage = location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/account');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {!isAuthPage && <Navbar />}
      <main>
        <Routes>
          {/* Marketing Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/problem" element={<ProblemPage />} />
          <Route path="/solution" element={<SolutionPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Auth Pages */}
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Sign-Up Flow Pages */}
          <Route path="/signup/profile" element={<ProfilePage />} />
          <Route path="/signup/restaurants" element={<RestaurantsPage />} />
          <Route path="/signup/plan" element={<PlanPage />} />
          <Route path="/signup/payment" element={<PaymentPage />} />
          <Route path="/signup/complete" element={<CompletePage />} />

          {/* Account Portal Pages */}
          <Route path="/account/dashboard" element={<AccountDashboardPage />} />
          <Route path="/account/restaurants" element={<AccountRestaurantsPage />} />
          <Route path="/account/subscription" element={<AccountSubscriptionPage />} />
          <Route path="/account/referrals" element={<AccountReferralsPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}

      {/* AI Help Bot - Shows on auth and signup pages */}
      <AIHelpBot />
    </div>
  );
}

export default App;
