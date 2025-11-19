import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const Loan = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Investment Loans</h1>
          <p className="text-muted-foreground mb-4">
            We offer flexible financing options for qualified investors, enabling them to access investment opportunities with competitive terms and fast approvals.
          </p>
          <Link to="/company/investments" className="text-primary hover:underline">Related investments</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Loan;
