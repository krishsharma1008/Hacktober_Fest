import { Calendar, Users, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroBg from "@/assets/hero-bg.jpg";
import qrCode from "@/assets/qr-register.png";

interface OverviewTabProps {
  onRegisterClick: () => void;
}

export const OverviewTab = ({ onRegisterClick }: OverviewTabProps) => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden rounded-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-glitch">
            HACKTOBERFEST
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-2">October 30 – 31, 2025</p>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 italic">
            "In 48 hours, you can build the next big thing in tech at Zapcom."
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow px-8 py-6 text-lg"
              onClick={onRegisterClick}
            >
              Click to Register
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-8 py-6 text-lg backdrop-blur-sm"
            >
              <Calendar className="mr-2" />
              Add to Calendar
            </Button>
          </div>

          {/* QR Code Section */}
          <div className="mt-12 inline-block bg-primary-foreground p-6 rounded-xl shadow-strong">
            <img 
              src={qrCode} 
              alt="Scan QR code to register" 
              className="w-32 h-32 rounded-lg mb-3"
            />
            <p className="text-sm font-medium text-foreground">Scan to Register</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4">
        <Card className="shadow-medium">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-center">About the Event</h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
              Hacktoberfest 2025 is a 48-hour innovation sprint where Zapcom's brightest minds come together 
              to build cutting-edge solutions. Work alongside mentors, collaborate with peers, and transform 
              your ideas into reality. Whether you're an engineer, designer, or product manager, this is your 
              opportunity to make an impact.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Key Info Grid */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Registration Deadline</h3>
              <p className="text-muted-foreground">October 15, 2025</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Team Size</h3>
              <p className="text-muted-foreground">2–5 members</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Eligibility</h3>
              <p className="text-muted-foreground">Zapcom employees, interns & invited partners</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Mentor Assignment</h3>
              <p className="text-muted-foreground">After registration closes</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Event Timeline</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { date: "Oct 1–15", title: "Registration Open", desc: "Sign up with your team" },
            { date: "Oct 18", title: "Mentor Assignments", desc: "Meet your mentors and start planning" },
            { date: "Oct 30", title: "Kickoff & Theme Reveal", desc: "Event begins with theme announcement" },
            { date: "Oct 30–31", title: "Build Phase", desc: "48 hours to bring your ideas to life" },
            { date: "Oct 31", title: "Demos & Judging", desc: "Present your projects and win prizes" },
          ].map((item, idx) => (
            <Card key={idx} className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02]">
              <CardContent className="p-6 flex items-start gap-6">
                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-bold min-w-[100px] text-center">
                  {item.date}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Prizes Teaser */}
      <section className="container mx-auto px-4">
        <Card className="shadow-strong bg-gradient-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Exciting Prizes & Opportunities Await!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-4xl mb-3">🥇</div>
                <h3 className="font-semibold mb-2">1st Place</h3>
                <p className="text-primary-foreground/80">Trophy + Vouchers + Incubation Opportunity</p>
              </div>
              <div>
                <div className="text-4xl mb-3">🥈</div>
                <h3 className="font-semibold mb-2">2nd Place</h3>
                <p className="text-primary-foreground/80">Premium Tech Gadgets</p>
              </div>
              <div>
                <div className="text-4xl mb-3">🥉</div>
                <h3 className="font-semibold mb-2">3rd Place</h3>
                <p className="text-primary-foreground/80">Exclusive Gift Hampers</p>
              </div>
            </div>
            <p className="mt-8 text-primary-foreground/90">All participants receive certificates & networking opportunities!</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
