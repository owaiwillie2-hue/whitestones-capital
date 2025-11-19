import { Link } from "react-router-dom";
import { Play } from "lucide-react";

const Cryptocurrencies = () => {
  return (
    <div className="container mx-auto px-4 py-20 min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            What is Bitcoin?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A short explainer video about Bitcoin. Watch the video below to learn the basics — what Bitcoin is, how it works, and common use cases.
          </p>
        </div>

        {/* Video Container with Hover Effect */}
        <div className="relative group mb-12">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          
          {/* Video Frame */}
          <div className="relative bg-background rounded-xl overflow-hidden shadow-2xl">
            <div className="relative w-full pt-[56.25%]">
              <iframe
                src="https://www.youtube.com/embed/Gc2en3nHxA4"
                title="What is Bitcoin?"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-lg"
              />
            </div>
          </div>

          {/* Play Indicator on Hover */}
          <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/10 transition duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition duration-300 transform scale-75 group-hover:scale-100">
              <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-xl">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">Learn the Basics</h3>
            <p className="text-muted-foreground">Understand what Bitcoin is and how it operates as a decentralized currency.</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <p className="text-muted-foreground">Discover the technology behind Bitcoin and blockchain transactions.</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-muted-foreground">Explore practical applications and why Bitcoin matters in today's world.</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-accent transition font-medium">
            ← Return to home
          </Link>
          <Link to="/company/cryptocurrencies" className="inline-flex items-center gap-2 text-primary hover:text-accent transition font-medium">
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cryptocurrencies;
