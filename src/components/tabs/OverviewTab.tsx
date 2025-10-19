import { CalendarCheck, UserSquare2, Award, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import hacktoberfestImage from "@/assets/Hacktober fest.png";
import registerButtonImage from "@/assets/register now button.png";

interface OverviewTabProps {
  onRegisterClick: () => void;
}

export const OverviewTab = ({ onRegisterClick }: OverviewTabProps) => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden rounded-2xl">
        <img 
          src={hacktoberfestImage} 
          alt="Hacktoberfest 2025" 
          className="w-full h-full object-cover rounded-2xl"
        />
        
        {/* Register Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mt-32">
            <a 
              href="https://forms.office.com/Pages/ResponsePage.aspx?id=toLqJa7fo0WHEvkl0bM5fY9njN3EQ8xNhehTF4aQ2otURVMxTFlFOVlPMFhSRE1YUE1JTDEyWEg5NS4u"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:scale-105 transition-transform duration-200"
            >
              <img 
                src={registerButtonImage} 
                alt="Register Now" 
                className="h-16 w-auto mx-auto cursor-pointer"
              />
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4">
        <Card className="shadow-medium border-4 border-primary bg-card/90 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-retro mb-6 text-center text-shadow-retro">About the Event</h2>
            <p className="text-base md:text-lg text-foreground text-center max-w-3xl mx-auto leading-relaxed font-sans">
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
        <h2 className="text-2xl md:text-3xl font-retro mb-8 text-center text-shadow-retro">Key Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-medium border-4 border-primary hover:border-primary-glow transition-all hover:scale-105 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-primary pixelated" strokeWidth={2.5} />
              <h3 className="font-retro text-xs mb-3">Registration Deadline</h3>
              <p className="text-foreground font-sans">October 23, 2025</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-medium border-4 border-primary hover:border-primary-glow transition-all hover:scale-105 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <UserSquare2 className="w-12 h-12 mx-auto mb-4 text-primary pixelated" strokeWidth={2.5} />
              <h3 className="font-retro text-xs mb-3">Team Size</h3>
              <p className="text-foreground font-sans">2–5 members</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-medium border-4 border-accent hover:border-secondary transition-all hover:scale-105 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-accent pixelated" strokeWidth={2.5} />
              <h3 className="font-retro text-xs mb-3">Eligibility</h3>
              <p className="text-foreground font-sans text-sm">Zapcom employees, interns & invited partners</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-medium border-4 border-accent hover:border-secondary transition-all hover:scale-105 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Timer className="w-12 h-12 mx-auto mb-4 text-accent pixelated" strokeWidth={2.5} />
              <h3 className="font-retro text-xs mb-3">Mentor Assignment</h3>
              <p className="text-foreground font-sans">After registration closes</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 pb-24">
        <h2 className="text-2xl md:text-3xl font-retro mb-8 text-center text-shadow-retro">Event Timeline</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { date: "Oct 1–23", title: "Registration Open", desc: "Sign up with your team" },
            { date: "Oct 18", title: "Mentor Assignments", desc: "Meet your mentors and start planning" },
            { date: "Oct 30", title: "Kickoff & Theme Reveal", desc: "Event begins with theme announcement" },
            { date: "Oct 30–31", title: "Build Phase", desc: "48 hours to bring your ideas to life" },
            { date: "Oct 31", title: "Demos & Judging", desc: "Present your projects and win prizes" },
          ].map((item, idx) => (
            <Card key={idx} className="shadow-medium border-4 border-primary hover:border-primary-glow transition-all hover:scale-[1.02] bg-card/90 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
                <div className="bg-accent text-accent-foreground shadow-medium px-4 py-3 font-retro text-xs min-w-[120px] text-center">
                  {item.date}
                </div>
                <div className="flex-1">
                  <h3 className="font-retro text-sm md:text-base mb-2">{item.title}</h3>
                  <p className="text-foreground font-sans">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
};
