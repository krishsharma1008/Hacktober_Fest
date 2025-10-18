import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import SubmitProject from "./pages/SubmitProject";
import MyProjects from "./pages/MyProjects";
import JudgeDashboard from "./pages/JudgeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            
            {/* User Routes */}
            <Route 
              path="/submit-project" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <SubmitProject />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-projects" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <MyProjects />
                </ProtectedRoute>
              } 
            />
            
            {/* Judge Routes */}
            <Route 
              path="/judge-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['judge', 'admin']}>
                  <JudgeDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
