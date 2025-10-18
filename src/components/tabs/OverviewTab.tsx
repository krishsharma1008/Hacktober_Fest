import { Calendar, Users, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    </div>
  );
};
