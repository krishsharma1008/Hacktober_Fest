import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Trophy,
  Users,
  Code,
  FileText,
  Award,
} from "lucide-react";

export const RulesTab = () => {
  return (
    <div className="container mx-auto px-4 py-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-retro mb-4 text-shadow-retro">
            Rules & Guidelines
          </h1>
          <p className="text-lg text-foreground font-sans">
            Everything you need to know to participate
          </p>
        </div>

        {/* Eligibility */}
        <Card className="shadow-medium border-4 border-primary bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-retro text-base">
              <Users className="w-6 h-6 text-primary pixelated" />
              Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-sans">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Open to all Zapcom employees and interns
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Invited partners and collaborators are welcome
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Team size must be between 2 and 5 members
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Development Rules */}
        <Card className="shadow-medium border-4 border-primary bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-retro text-base">
              <Code className="w-6 h-6 text-primary pixelated" />
              Development Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-sans">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                All code must be written during the event (Oct 29–31, 2025)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Use of open-source libraries and APIs is allowed with proper
                attribution
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Pre-existing code or projects are not permitted
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Projects must align with the announced theme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Requirements */}
        <Card className="shadow-medium border-4 border-accent bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-retro text-base">
              <FileText className="w-6 h-6 text-accent pixelated" />
              Submission Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-sans">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <strong>Repository URL:</strong> Complete source code with
                documentation
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <strong>Demo Video:</strong> 3–5 minute video showcasing your
                project
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <strong>README:</strong> Installation guide, features, and tech
                stack
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <strong>One-Pager:</strong> Problem statement and solution
                summary
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <strong>Presentation Deck:</strong> Slides for final
                presentation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Judging Criteria */}
        <Card className="shadow-medium border-4 border-accent bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-retro text-base">
              <Trophy className="w-6 h-6 text-accent pixelated" />
              Judging Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/20 border-2 border-primary shadow-medium">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-retro text-xs">
                    Innovation and Creativity
                  </h3>
                  <span className="text-2xl font-retro text-accent">25%</span>
                </div>
                <p className="text-sm text-foreground">
                  Is this fresh and impactful?
                </p>
              </div>

              <div className="p-4 bg-primary/20 border-2 border-primary shadow-medium">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-retro text-xs">Relevance to Theme</h3>
                  <span className="text-2xl font-retro text-accent">20%</span>
                </div>
                <p className="text-sm text-foreground">
                  Have you truly innovated using Al? (Brownie points for Al
                  Agentic outcome)
                </p>
              </div>

              <div className="p-4 bg-primary/20 border-2 border-primary shadow-medium">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-retro text-xs">
                    Feasibility & Market Viability
                  </h3>
                  <span className="text-2xl font-retro text-accent">20%</span>
                </div>
                <p className="text-sm text-foreground">
                  How well is it built? Could it scale?
                </p>
              </div>

              <div className="p-4 bg-primary/20 border-2 border-primary shadow-medium">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-retro text-xs">Business Impact</h3>
                  <span className="text-2xl font-retro text-accent">15%</span>
                </div>
                <p className="text-sm text-foreground">
                  Can this deliver real value/ROI to Zapcom or its
                  customers/prospects?
                </p>
              </div>

              <div className="p-4 bg-primary/20 border-2 border-primary shadow-medium">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-retro text-xs">
                    Presentation & Message Delivery
                  </h3>
                  <span className="text-2xl font-retro text-accent">15%</span>
                </div>
                <p className="text-sm text-foreground">
                  Demos get brownie points
                </p>
              </div>

              <div className="p-4 bg-primary/20 border-2 border-primary shadow-medium">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-retro text-xs">Team diversity</h3>
                  <span className="text-2xl font-retro text-accent">5%</span>
                </div>
                <p className="text-sm text-foreground">
                  How diverse is your team?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code of Conduct */}
        <Card className="shadow-medium border-4 border-primary bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-retro text-base">
              <Award className="w-6 h-6 text-primary pixelated" />
              Code of Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 font-sans">
            <p className="text-foreground">All participants are expected to:</p>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Be respectful and inclusive to all participants
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Collaborate in good faith and avoid plagiarism
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Follow organizer instructions and event schedules
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="shadow-medium border-4 border-primary bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center font-sans">
            <p className="mb-2 font-retro text-xs">Need clarification?</p>
            <p className="text-foreground">
              Contact us at{" "}
              <a
                href="mailto:zapminds@zapcg.com"
                className="text-accent hover:text-secondary underline"
              >
                zapminds@zapcg.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
