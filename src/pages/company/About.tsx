import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const CompanyInfo = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">About Whitestones Markets</h1>
          <p className="text-muted-foreground mb-4">
            Whitestones Markets is a premier investment platform dedicated to creating exceptional wealth-building opportunities for our clients. We operate across multiple asset classes with a commitment to transparency, regulatory compliance, and long-term value creation.
          </p>
          <p className="text-muted-foreground mb-6">
            Our mission is to empower investors with access to professional-grade investment opportunities, supported by expert guidance and cutting-edge technology.
          </p>
          <Link to="/" className="text-primary hover:underline">Back to home</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CompanyInfo;
