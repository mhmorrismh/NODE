import { Camera, Coffee, FileText, Sparkles, Upload, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ChatModal } from "~/components/ui/chat-modal";

export default function CoffeeAnalyzer() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/NODE logo.png" alt="NODE Logo" className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-xl font-bold leading-tight" style={{ fontFamily: "'Copperplate Gothic Bold', 'Copperplate', 'Copperplate Gothic Light', serif" }}>NODE</span>
                <span className="text-sm font-medium leading-tight" style={{ fontFamily: "'Copperplate Gothic Bold', 'Copperplate', 'Copperplate Gothic Light', serif" }}>COFFEE ROASTERS</span>
              </div>
            </Link>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <img src="/NODE logo.png" alt="NODE Logo" className="h-10 w-10" />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              AI-Powered{" "}
              <span className="text-orange-600">Coffee Bean</span> Analysis
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Upload a photo of your coffee packaging and get instant, detailed 
              analysis including origin, flavor notes, roast level, and brewing recommendations.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => setIsChatOpen(true)}>
                <Upload className="mr-2 h-5 w-5" />
                Analyze Your Coffee
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">Upload & Analyze</h2>
              <p className="mb-6 text-muted-foreground">
                Simply take a photo of your coffee package or upload an existing image. 
                Our AI will analyze the packaging and provide detailed insights about your coffee.
              </p>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Click "Analyze Your Coffee" above to get started!
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-semibold">Analysis Results</h3>
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    Analysis results will appear here after uploading
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold">Why Choose Bean Analyzer?</h2>
            <p className="text-muted-foreground">
              Get professional coffee insights in seconds with our AI-powered analysis
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Instant Analysis</CardTitle>
                <CardDescription>
                  Get detailed coffee information in under 3 seconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Detailed Reports</CardTitle>
                <CardDescription>
                  Comprehensive analysis including origin, flavor notes, and brewing tips
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>AI-Powered</CardTitle>
                <CardDescription>
                  Advanced machine learning trained on thousands of coffee varieties
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Three simple steps to analyze your coffee
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Upload Image</h3>
              <p className="text-muted-foreground">
                Take a photo or upload an image of your coffee packaging
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes the packaging and extracts detailed information
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Get Results</h3>
              <p className="text-muted-foreground">
                Receive comprehensive analysis with flavor notes and brewing tips
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Analyze Your Coffee?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of coffee enthusiasts who use Bean Analyzer to discover 
            more about their favorite brews.
          </p>
          <Button size="lg" onClick={() => setIsChatOpen(true)}>
            <Upload className="mr-2 h-5 w-5" />
            Start Analyzing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-orange-600" />
              <span className="font-bold">Bean Analyzer</span>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/">Back to Main Site</Link>
            </Button>
          </div>
        </div>
      </footer>

      {/* Advanced Coffee Analysis Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
} 