/* eslint-disable @typescript-eslint/no-explicit-any */
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
            <h2 className="text-2xl md:text-3xl font-retro mb-6 text-center text-shadow-retro">About HacktoberFest</h2>
            <p className="text-base md:text-lg text-foreground text-center max-w-3xl mx-auto leading-relaxed font-sans">
              What can you do in 48 hours? How about solving a challenge to build the next big thing in tech at Zapcom? The best part though - you get to work alongside mentors, collaborate with peers, and pull a Steve Jobs-esque presentation, because you could be building the next Apple. Know how Facebook started? That could be you next, and here's your opportunity. So, Game On!!
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Key Info Grid */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-retro mb-8 text-center text-shadow-retro">Mission Briefing</h2>
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
        <h2 className="text-2xl md:text-3xl font-retro mb-8 text-center text-shadow-retro">Mission Milestones</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          {[
            {
              date: "Oct 29",
              events: [
                { title: "5 PM: KICK OFF & OPENING CEREMONY", desc: "Event begins with kickoff and opening ceremony" },
                { title: "8 PM: CHECK POINT 1", desc: "First checkpoint" },
              ]
            },
            {
              date: "Oct 30",
              events: [
                { title: "10 AM: CHECK POINT 2", desc: "Second checkpoint" },
                { title: "5 PM: How to Pitch your Hack", desc: "Training session on pitching your project" },
                { title: "6 PM: CHECK POINT 3", desc: "Third checkpoint" },
              ]
            },
            {
              date: "Oct 31",
              events: [
                { title: "10 AM: CHECK POINT 4", desc: "Fourth checkpoint" },
                { title: "1 PM: FINAL CHECK POINT", desc: "Final checkpoint" },
                { title: "3 PM: CLOSING BELL & SUBMISSIONS", desc: "Submissions close" },
                { title: "3:30 PM: PRESENTATIONS AND AWARDS", desc: "Present your projects and win prizes" },
                { title: "7 PM: BEERS AND STUFF", desc: "Celebration time" },
              ]
            },
          ].map((day, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-xl font-retro text-primary border-b-2 border-primary pb-2">{day.date}</h3>
              {day.events.map((event, eventIdx) => (
                <Card key={eventIdx} className="shadow-medium border-4 border-primary hover:border-primary-glow transition-all hover:scale-[1.02] bg-card/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h4 className="font-retro text-sm md:text-base mb-2">{event.title}</h4>
                    <p className="text-foreground font-sans">{event.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
