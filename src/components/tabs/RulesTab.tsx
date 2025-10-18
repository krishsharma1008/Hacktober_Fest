import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Trophy, Users, Code, FileText, Award } from "lucide-react";

export const RulesTab = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Rules & Guidelines</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to participate
          </p>
        </div>

        {/* Eligibility */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Open to all Zapcom employees and interns</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Invited partners and collaborators are welcome</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Team size must be between 2 and 5 members</p>
            </div>
          </CardContent>
        </Card>

        {/* Development Rules */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-6 h-6 text-primary" />
              Development Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>All code must be written during the event (Oct 30–31, 2025)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Use of open-source libraries and APIs is allowed with proper attribution</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Pre-existing code or projects are not permitted</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Projects must align with the announced theme</p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Requirements */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Submission Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p><strong>GitHub Repository:</strong> Complete source code with documentation</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p><strong>Demo Video:</strong> 3–5 minute video showcasing your project</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p><strong>README:</strong> Installation guide, features, and tech stack</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p><strong>One-Pager:</strong> Problem statement and solution summary</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <p><strong>Presentation Deck:</strong> Slides for final presentation</p>
            </div>
          </CardContent>
        </Card>

        {/* Judging Criteria */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent" />
              Judging Criteria (100 Points Total)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Innovation</h3>
                  <span className="text-2xl font-bold text-primary">30</span>
                </div>
                <p className="text-sm text-muted-foreground">Originality and creativity of the solution</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Technical Execution</h3>
                  <span className="text-2xl font-bold text-primary">25</span>
                </div>
                <p className="text-sm text-muted-foreground">Code quality and architecture</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Impact & Feasibility</h3>
                  <span className="text-2xl font-bold text-primary">25</span>
                </div>
                <p className="text-sm text-muted-foreground">Real-world value and scalability</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">UX & Presentation</h3>
                  <span className="text-2xl font-bold text-primary">20</span>
                </div>
                <p className="text-sm text-muted-foreground">Design and demo quality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code of Conduct */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Code of Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>All participants are expected to:</p>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Be respectful and inclusive to all participants</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Collaborate in good faith and avoid plagiarism</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p>Follow organizer instructions and event schedules</p>
            </div>
          </CardContent>
        </Card>

        {/* IP Note */}
        <Card className="shadow-medium border-accent">
          <CardContent className="p-6">
            <p className="text-sm">
              <strong>Intellectual Property:</strong> Participants retain ownership of their projects. 
              Zapcom reserves the right to showcase winning projects for promotional purposes with proper attribution.
            </p>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="shadow-medium bg-muted">
          <CardContent className="p-6 text-center">
            <p className="mb-2 font-semibold">Need clarification?</p>
            <p className="text-muted-foreground">
              Contact us at{" "}
              <a href="mailto:zapminds@zapcomgroup.com" className="text-primary hover:underline">
                zapminds@zapcomgroup.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
