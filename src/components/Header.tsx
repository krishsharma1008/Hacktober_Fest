import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import zapcomLogo from "@/assets/zapcom-logo.png";

const guestTabs = [
  { id: "overview", label: "Overview" },
  { id: "participants", label: "Participants" },
  { id: "rules", label: "Rules" },
  { id: "gallery", label: "Project Gallery" },
  { id: "leaderboard", label: "LeaderBoard" },
  { id: "updates", label: "Updates" },
  { id: "discussions", label: "Discussions" },
];

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const tabs = guestTabs;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-4 border-primary shadow-medium">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="https://zapcom.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src={zapcomLogo} alt="Zapcom" className="h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="relative"
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              ))}
            </nav>

            {/* Auth Button / User Menu */}
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(user.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {role !== "judge" ? (
                        <DropdownMenuItem
                          onClick={() => navigate("/submit-project")}
                        >
                          Submit Project
                        </DropdownMenuItem>
                      ) : null}
                      {role !== "judge" ? (
                        <DropdownMenuItem
                          onClick={() => navigate("/my-projects")}
                        >
                          My Projects
                        </DropdownMenuItem>
                      ) : null}
                      {role === "judge" || role === "admin" ? (
                        <DropdownMenuItem
                          onClick={() => navigate("/judge-dashboard")}
                        >
                          Judge Dashboard
                        </DropdownMenuItem>
                      ) : null}
                      {role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin-dashboard")}
                        >
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={() => navigate("/auth")} className="ml-2">
                    Sign In / Register
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {tab.label}
                </Button>
              ))}

              {!loading && (
                <>
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate("/submit-project");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Submit Project
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate("/my-projects");
                          setMobileMenuOpen(false);
                        }}
                      >
                        My Projects
                      </Button>
                      {(role === "judge" || role === "admin") && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => {
                            navigate("/judge-dashboard");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Judge Dashboard
                        </Button>
                      )}
                      {role === "admin" && (
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => {
                            navigate("/admin-dashboard");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Admin Dashboard
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="justify-start text-destructive"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Sign In / Register
                    </Button>
                  )}
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
