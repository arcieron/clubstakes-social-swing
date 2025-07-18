import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Users, Shield, Target, CheckCircle, ArrowRight, Zap, MessageCircle, Award, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ClubInquiryForm } from './ClubInquiryForm';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const rotatingTexts = ["Bragging Rights", "A Competition", "More Fun"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: RefreshCw,
      title: "Drives More Play",
      description: "Pins gives members a reason to get out and compete — with more rounds, more friendly rivalries, and even more guests joining the fun."
    },
    {
      icon: MessageCircle,
      title: "Boosts Member Engagement", 
      description: "Social feeds, trash talk, badges, and exclusive club leaderboards create a tight-knit club culture around play and pride."
    },
    {
      icon: Shield,
      title: "Exclusive to Private Clubs",
      description: "Pins is only available to private clubs. Non-members can't use it — but they'll want to. That exclusivity creates real value and intrigue."
    },
    {
      icon: Award,
      title: "Improves Retention",
      description: "Pins becomes part of the reason members stay. More engagement → stronger ties → longer memberships."
    }
  ];

  const included = [
    "GHIN Handicap Scoring",
    "Course data + auto scoring", 
    "Social leaderboard and feed",
    "Admin panel for your club",
    "Easy onboarding for members"
  ];

  const howItWorks = [
    "Members join via club invite code",
    "Everyone gets 10,000 Pins Credits to start the season",
    "They can challenge each other to games like Match Play, Nassau, and Skins",
    "Win or lose, every round updates the club leaderboard",
    "All bets are tracked. No cash. Just status."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-primary py-20 relative">
        <div className="absolute top-6 right-6">
          <Button 
            onClick={onGetStarted} 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Sign In
          </Button>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/44ebd465-7492-4344-97fc-8f8a5d43c419.png" 
                alt="Pins Logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              The Private Club Golf App<br />
              That Turns Every Round Into<br />
              <span className="text-accent inline-block min-h-[1.2em]">
                <span 
                  key={currentTextIndex}
                  className="animate-fadeInSlide inline-block"
                >
                  {rotatingTexts[currentTextIndex]}
                </span>
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              A GHIN-integrated, private club betting app that lets members challenge each other for fun, 
              not money — just exclusive in-club Pins Credits.
            </p>
            <Button 
              onClick={() => setShowInquiryForm(true)}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 animate-scale-in"
            >
              Join the Competition
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your club up and running in minutes with our simple, streamlined process
            </p>
          </div>
          
          <div className="space-y-6">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-lg font-medium group-hover:text-gray-900 transition-colors duration-300">
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Clubs Love It */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Why Clubs Love It</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {included.map((item, index) => (
              <div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-gray-700 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Simple, Fair Pricing</h2>
          <Card className="bg-white text-gray-900 p-8 max-w-md mx-auto animate-scale-in">
            <div className="text-4xl font-bold text-primary mb-4">One Low Annual Fee</div>
            <p className="text-xl text-gray-600 mb-6">per club</p>
            <p className="text-gray-700 mb-4">Unlimited members.</p>
            <p className="text-gray-700 mb-6">Unlimited games.</p>
            <p className="text-sm text-primary font-medium">
              No per-user fees. No hidden costs. Just pure golf competition.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Ready to Add More Fun to Every Round?
          </h2>
          <Button 
            onClick={() => setShowInquiryForm(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-12 py-4 animate-scale-in"
          >
            Get Started Today
            <Zap className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/44ebd465-7492-4344-97fc-8f8a5d43c419.png" 
              alt="Pins Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold">Pins</span>
          </div>
          <p className="text-gray-400">© 2024 Pins. All rights reserved.</p>
        </div>
      </footer>

      <ClubInquiryForm 
        isOpen={showInquiryForm} 
        onClose={() => setShowInquiryForm(false)} 
      />
    </div>
  );
};
