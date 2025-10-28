import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Trophy, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import zapcomLogo from "@/assets/zapcom-logo.png";

export const NavigationHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: "Home", path: "/" },
    // { label: "Projects", path: "/projects" },
    { label: "Updates", path: "/updates" },
    { label: "Discussions", path: "/discussions" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={zapcomLogo} alt="Zapcom" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </Button>
            ))}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {role === 'user' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/submit-project')}>
                        <Trophy className="mr-2 h-4 w-4" />
                        Submit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/my-projects')}>
                        <Trophy className="mr-2 h-4 w-4" />
                        My Projects
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {role === 'judge' && (
                    <DropdownMenuItem onClick={() => navigate('/judge-dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Judge Dashboard
                    </DropdownMenuItem>
                  )}
                  
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </nav>

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
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </Button>
              ))}

              {user ? (
                <>
                  {role === 'user' && (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate('/submit-project');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Submit Project
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate('/my-projects');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        My Projects
                      </Button>
                    </>
                  )}
                  
                  {role === 'judge' && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate('/judge-dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Judge Dashboard
                    </Button>
                  )}
                  
                  {role === 'admin' && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        navigate('/admin-dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  className="justify-start"
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
