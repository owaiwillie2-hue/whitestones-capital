import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const NFT = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">NFTs</h1>
          <p className="text-muted-foreground mb-4">
            Non-fungible tokens represent unique digital assets. We work with creators and collectors to offer curated opportunities in the NFT space.
          </p>
          <Link to="/company/cryptocurrencies" className="text-primary hover:underline">Cryptocurrency services</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default NFT;
