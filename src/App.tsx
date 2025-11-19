import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import Deposit from "./pages/dashboard/Deposit";
import Withdraw from "./pages/dashboard/Withdraw";
import Transactions from "./pages/dashboard/Transactions";
import Investments from "./pages/dashboard/Investments";
import Plans from "./pages/dashboard/Plans";
import Profile from "./pages/dashboard/Profile";
import Referrals from "./pages/dashboard/Referrals";
import KYC from "./pages/dashboard/KYC";
import Settings from "./pages/dashboard/Settings";
import ActivityLog from "./pages/dashboard/ActivityLog";
import Cryptocurrencies from "./pages/Cryptocurrencies";
import WhitestonesMarkets from "./pages/company/WhitestonesMarkets";
import InvestmentsInfo from "./pages/company/InvestmentsInfo";
import CryptocurrenciesInfo from "./pages/company/CryptocurrenciesInfo";
import RealEstate from "./pages/company/RealEstate";
import OilAndGas from "./pages/company/OilAndGas";
import NFT from "./pages/company/NFT";
import Retirement from "./pages/company/Retirement";
import Loan from "./pages/company/Loan";
import CompanyInfo from "./pages/company/About";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardOverview />} />
              <Route path="deposit" element={<Deposit />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="investments" element={<Investments />} />
              <Route path="plans" element={<Plans />} />
              <Route path="profile" element={<Profile />} />
              <Route path="referrals" element={<Referrals />} />
              <Route path="kyc" element={<KYC />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activity" element={<ActivityLog />} />
            </Route>
            <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
            <Route path="/company/whitestones-markets" element={<WhitestonesMarkets />} />
            <Route path="/company/investments" element={<InvestmentsInfo />} />
            <Route path="/company/cryptocurrencies" element={<CryptocurrenciesInfo />} />
            <Route path="/company/real-estate" element={<RealEstate />} />
            <Route path="/company/oil-and-gas" element={<OilAndGas />} />
            <Route path="/company/nft" element={<NFT />} />
            <Route path="/company/retirement" element={<Retirement />} />
            <Route path="/company/loan" element={<Loan />} />
            <Route path="/company/about" element={<CompanyInfo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
