import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Users, Shield, Target, CheckCircle, ArrowRight, Zap, MessageCircle, Award, RefreshCw } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
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
    "GHIN handicap syncing",
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
            Get Started
          </Button>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/44ebd465-7492-4344-97fc-8f8a5d43c419.png" 
                alt="Pins Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              The Private Club Golf App<br />
              That Turns Every Round Into<br />
              <span className="text-accent">Bragging Rights</span>
            </h1>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              A GHIN-integrated, private club betting app that lets members challenge each other for fun, 
              not money — just exclusive in-club Pins Credits.
            </p>
            <Button 
              onClick={onGetStarted}
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
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{step}</p>
                </div>
              </Card>
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
          <h2 className="text-3xl font-bold mb-8">Pricing</h2>
          <Card className="bg-white text-gray-900 p-8 max-w-md mx-auto animate-scale-in">
            <div className="text-4xl font-bold text-primary mb-4">$1,500/year</div>
            <p className="text-xl text-gray-600 mb-6">per club</p>
            <p className="text-gray-700 mb-6">Unlimited members.</p>
            <p className="text-sm text-primary font-medium">
              First 5 clubs get Founding Status and early feature input.
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
            onClick={onGetStarted}
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
    </div>
  );
};
