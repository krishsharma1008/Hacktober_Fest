import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

export const RegistrationModal = ({ open, onClose }: RegistrationModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    member1Name: "",
    member1Email: "",
    member1Phone: "",
    member1Designation: "",
    member2Name: "",
    member2Email: "",
    member2Phone: "",
    member2Designation: "",
    member3Name: "",
    member3Email: "",
    member3Phone: "",
    member3Designation: "",
    member4Name: "",
    member4Email: "",
    member4Phone: "",
    member4Designation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to register for the hackathon.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            team_name: formData.teamName,
            leader_id: user.id,
            member1_name: formData.member1Name || null,
            member1_email: formData.member1Email || null,
            member1_phone: formData.member1Phone || null,
            member1_designation: formData.member1Designation || null,
            member2_name: formData.member2Name || null,
            member2_email: formData.member2Email || null,
            member2_phone: formData.member2Phone || null,
            member2_designation: formData.member2Designation || null,
            member3_name: formData.member3Name || null,
            member3_email: formData.member3Email || null,
            member3_phone: formData.member3Phone || null,
            member3_designation: formData.member3Designation || null,
            member4_name: formData.member4Name || null,
            member4_email: formData.member4Email || null,
            member4_phone: formData.member4Phone || null,
            member4_designation: formData.member4Designation || null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Team registered successfully!",
        description: "Your hackathon registration is complete."
      });
      
      onClose();
      setFormData({
        teamName: "",
        member1Name: "",
        member1Email: "",
        member1Phone: "",
        member1Designation: "",
        member2Name: "",
        member2Email: "",
        member2Phone: "",
        member2Designation: "",
        member3Name: "",
        member3Email: "",
        member3Phone: "",
        member3Designation: "",
        member4Name: "",
        member4Email: "",
        member4Phone: "",
        member4Designation: "",
      });
      
      navigate('/projects');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Register Team for Hacktoberfest 2025</DialogTitle>
          <p className="text-muted-foreground">Fill out your team details (up to 4 additional members)</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              required
              placeholder="Enter your team name"
            />
          </div>

          {/* Member 1 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Member 1</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member1Name">Full Name</Label>
                <Input
                  id="member1Name"
                  name="member1Name"
                  value={formData.member1Name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member1Email">Email</Label>
                <Input
                  id="member1Email"
                  name="member1Email"
                  type="email"
                  value={formData.member1Email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member1Phone">Phone</Label>
                <Input
                  id="member1Phone"
                  name="member1Phone"
                  value={formData.member1Phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member1Designation">Designation</Label>
                <Input
                  id="member1Designation"
                  name="member1Designation"
                  value={formData.member1Designation}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>

          {/* Member 2 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Member 2</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member2Name">Full Name</Label>
                <Input
                  id="member2Name"
                  name="member2Name"
                  value={formData.member2Name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member2Email">Email</Label>
                <Input
                  id="member2Email"
                  name="member2Email"
                  type="email"
                  value={formData.member2Email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member2Phone">Phone</Label>
                <Input
                  id="member2Phone"
                  name="member2Phone"
                  value={formData.member2Phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member2Designation">Designation</Label>
                <Input
                  id="member2Designation"
                  name="member2Designation"
                  value={formData.member2Designation}
                  onChange={handleChange}
                  placeholder="Designer"
                />
              </div>
            </div>
          </div>

          {/* Member 3 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Member 3 (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member3Name">Full Name</Label>
                <Input
                  id="member3Name"
                  name="member3Name"
                  value={formData.member3Name}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member3Email">Email</Label>
                <Input
                  id="member3Email"
                  name="member3Email"
                  type="email"
                  value={formData.member3Email}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member3Phone">Phone</Label>
                <Input
                  id="member3Phone"
                  name="member3Phone"
                  value={formData.member3Phone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member3Designation">Designation</Label>
                <Input
                  id="member3Designation"
                  name="member3Designation"
                  value={formData.member3Designation}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Member 4 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Member 4 (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member4Name">Full Name</Label>
                <Input
                  id="member4Name"
                  name="member4Name"
                  value={formData.member4Name}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member4Email">Email</Label>
                <Input
                  id="member4Email"
                  name="member4Email"
                  type="email"
                  value={formData.member4Email}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member4Phone">Phone</Label>
                <Input
                  id="member4Phone"
                  name="member4Phone"
                  value={formData.member4Phone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member4Designation">Designation</Label>
                <Input
                  id="member4Designation"
                  name="member4Designation"
                  value={formData.member4Designation}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> You must be signed in to register. Team size: 2–5 members. 
              Registration closes on October 15, 2025.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
