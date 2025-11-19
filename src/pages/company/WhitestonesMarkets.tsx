import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const WhitestonesMarkets = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Whitestones Markets</h1>
          <p className="text-muted-foreground mb-4">
            Whitestones Markets is the brand under which we provide diversified investment products across digital assets, real estate, commodities and more. We combine technology, research, and regulatory compliance to help clients grow their wealth.
          </p>
          <Link to="/" className="text-primary hover:underline">Back to home</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default WhitestonesMarkets;
