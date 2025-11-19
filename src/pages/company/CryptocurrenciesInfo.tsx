import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const CryptocurrenciesInfo = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Cryptocurrencies</h1>
          <p className="text-muted-foreground mb-4">
            Digital currencies and blockchain technology are integral to our products. We provide trading, custody, and educational resources to help clients understand crypto risks and opportunities.
          </p>
          <Link to="/cryptocurrencies" className="text-primary hover:underline">Watch: What is Bitcoin?</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CryptocurrenciesInfo;
