import React from "react";
import { X, Coffee, Star, MapPin, Thermometer, Clock, FileText, Download } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import Markdown from "react-markdown";

interface CoffeeProductViewProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  images: string[];
}

export function CoffeeProductView({ isOpen, onClose, analysis, images }: CoffeeProductViewProps) {
  if (!isOpen) return null;

  // Parse analysis data from the AI response
  const parseAnalysis = (analysisText: string) => {
    const data: Record<string, any> = {};
    
    // Extract roast level
    const roastMatch = analysisText.match(/Roast\s*level\s*Profile:\s*(\d+)\/5/i);
    if (roastMatch) {
      data.roastLevel = parseInt(roastMatch[1]);
    }
    
    // Extract origin
    const originMatch = analysisText.match(/Primary\s*coffee\s*origin:\s*([^\n]+)/i);
    const regionMatch = analysisText.match(/Specific\s*farm\/region\/processing\s*detail:\s*([^\n]+)/i);
    if (originMatch) {
      data.origin = originMatch[1].trim();
      if (regionMatch) {
        data.origin += ` - ${regionMatch[1].trim()}`;
      }
    }
    
    // Extract tasting notes (English translation)
    const tastingMatch = analysisText.match(/English\s*translation:\s*([^\n]+)/i);
    if (tastingMatch) {
      data.tastingNotes = tastingMatch[1].trim();
    }
    
    // Extract Expert Overview
    const expertMatch = analysisText.match(/Expert\s*Overview\s*(.*?)(?=\n\n|\n[A-Z]|$)/s);
    if (expertMatch) {
      data.expertOverview = expertMatch[1].trim();
    }
    
    // Extract in-depth sections
    data.aboutOrigin = extractSection(analysisText, "About the Origin");
    data.gradeAndSourcing = extractSection(analysisText, "Grade and Sourcing");
    data.processingMethod = extractSection(analysisText, "Processing Method");
    data.flavorProfile = extractSection(analysisText, "Flavor Profile");
    data.roastLevelDescription = extractSection(analysisText, "Roast Level");
    
    return data;
  };

  const extractSection = (text: string, sectionName: string) => {
    const regex = new RegExp(`${sectionName}\\s+(.*?)(?=\\n\\n[A-Z]|\\n[A-Z][a-z]+\\s+[A-Z]|$)`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  const analysisData = parseAnalysis(analysis);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <HeaderSection onClose={onClose} />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Product Image Section */}
            <ProductImageSection />
            
            {/* Words Section */}
            <WordsSection />
            
            {/* Expert Overview Section */}
            <ExpertOverviewSection overview={analysisData.expertOverview} />
            
            {/* Coffee Details Grid */}
            <CoffeeDetailsGrid 
              roastLevel={analysisData.roastLevel}
              origin={analysisData.origin}
              tastingNotes={analysisData.tastingNotes}
            />
            
            {/* Brewing Section */}
            <BrewingSection />
            
            {/* In-Depth Descriptions */}
            <InDepthDescriptionsSection 
              aboutOrigin={analysisData.aboutOrigin}
              gradeAndSourcing={analysisData.gradeAndSourcing}
              processingMethod={analysisData.processingMethod}
              flavorProfile={analysisData.flavorProfile}
              roastLevelDescription={analysisData.roastLevelDescription}
            />
            
            {/* Sign In to Save as PDF */}
            <SignInPDFSection />
            
            {/* Footnote */}
            <FootnoteSection />
          </div>
        </div>
      </div>
    </div>
  );
}

// Header Section Component
function HeaderSection({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
          <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Coffee Product Analysis</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">NODE COFFEE ROASTERS</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Product Image Section Component
function ProductImageSection() {
  return (
    <div className="flex justify-center">
      <div className="w-80 h-80 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
        <img 
          src="/NODE Product Image.png" 
          alt="NODE Coffee Product"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// Words Section Component
function WordsSection() {
  return (
    <div className="text-center">
      <div className="inline-block bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-lg">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          100% ARABICA   1/2 pound 226g±3
        </p>
      </div>
    </div>
  );
}

// Expert Overview Section Component
function ExpertOverviewSection({ overview }: { overview: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Expert Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {overview || "Expert overview will appear here after analysis."}
        </p>
      </CardContent>
    </Card>
  );
}

// Coffee Details Grid Component
function CoffeeDetailsGrid({ roastLevel, origin, tastingNotes }: { 
  roastLevel?: number; 
  origin?: string; 
  tastingNotes?: string; 
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Roast Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            Roast Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roastLevel ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded-full border-2 ${
                        level <= roastLevel
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{roastLevel}/5</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Light</span>
                <span>Dark</span>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Roast level will appear after analysis</p>
          )}
        </CardContent>
      </Card>

      {/* Origin */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            Origin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-300">
            {origin || "Origin information will appear after analysis"}
          </p>
        </CardContent>
      </Card>

      {/* Tasting Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-500" />
            Tasting Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tastingNotes ? (
            <div className="flex flex-wrap gap-2">
              {tastingNotes.split(',').map((note: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {note.trim()}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Tasting notes will appear after analysis</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Brewing Section Component
function BrewingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Brewing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">S.O.E.</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Single Origin Espresso brewing method recommended for this coffee.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Pour Over</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pour over method to highlight the unique flavor characteristics.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// In-Depth Descriptions Section Component
function InDepthDescriptionsSection({ 
  aboutOrigin, 
  gradeAndSourcing, 
  processingMethod, 
  flavorProfile, 
  roastLevelDescription 
}: { 
  aboutOrigin?: string;
  gradeAndSourcing?: string;
  processingMethod?: string;
  flavorProfile?: string;
  roastLevelDescription?: string;
}) {
  const sections = [
    { title: "About the Origin", content: aboutOrigin },
    { title: "Grade and Sourcing", content: gradeAndSourcing },
    { title: "Processing Method", content: processingMethod },
    { title: "Flavor Profile", content: flavorProfile },
    { title: "Roast Level", content: roastLevelDescription },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          In-Depth Descriptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-200">
              {section.title}
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {section.content || `${section.title} information will appear after analysis.`}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Sign In to Save as PDF Section Component
function SignInPDFSection() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="text-center">
          <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Sign In to Save as PDF
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Create an account to save and download your coffee analysis reports
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Sign In to Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Footnote Section Component
function FootnoteSection() {
  return (
    <div className="text-center space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        * Analysis results are based on AI interpretation of packaging information and may vary.
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        ** Please ensure a clear photo is used in order to get the most accurate response.
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Analysis powered by NODE Coffee AI • © 2024 NODE COFFEE ROASTERS
      </p>
    </div>
  );
} 