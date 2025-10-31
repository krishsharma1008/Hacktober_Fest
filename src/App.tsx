import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PumpkinChatbot } from "@/components/PumpkinChatbot";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import SubmitProject from "./pages/SubmitProject";
import EditProject from "./pages/EditProject";
import MyProjects from "./pages/MyProjects";
import JudgeDashboard from "./pages/JudgeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Updates from "./pages/Updates";
import Discussions from "./pages/Discussions";
import PacManGame from "./pages/PacManGame";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminLeaderboard from "./components/admin/AdminLeaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TeamProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PumpkinChatbot />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />{" "}
              {/* <-- add this */}
              {/* <Route path="/projects" element={<Projects />} /> */}
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/discussions" element={<Discussions />} />
              <Route path="/pacman-game" element={<PacManGame />} />
              {/* User Routes */}
              <Route
                path="/submit-project"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin"]}>
                    <SubmitProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-project/:id"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin"]}>
                    <EditProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-projects"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin"]}>
                    <MyProjects />
                  </ProtectedRoute>
                }
              />
              {/* Judge Routes */}
              <Route
                path="/judge-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["judge", "admin"]}>
                    <JudgeDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-leaderboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLeaderboard />
                  </ProtectedRoute>
                }
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TeamProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
