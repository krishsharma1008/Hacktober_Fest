import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { ParticipantsTab } from "@/components/tabs/ParticipantsTab";
import { RulesTab } from "@/components/tabs/RulesTab";
import { ProjectGalleryTab } from "@/components/tabs/ProjectGalleryTab";
import { UpdatesTab } from "@/components/tabs/UpdatesTab";
import { DiscussionsTab } from "@/components/tabs/DiscussionsTab";
import { RegistrationModal } from "@/components/RegistrationModal";
import { PixelatedClouds } from "@/components/PixelatedClouds";
import { PixelatedGrass } from "@/components/PixelatedGrass";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRegistration, setShowRegistration] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onRegisterClick={() => setShowRegistration(true)} />;
      case "participants":
        return <ParticipantsTab />;
      case "rules":
        return <RulesTab />;
      case "gallery":
        return <ProjectGalleryTab />;
      case "updates":
        return <UpdatesTab />;
      case "discussions":
        return <DiscussionsTab />;
      default:
        return <OverviewTab onRegisterClick={() => setShowRegistration(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-primary relative overflow-hidden">
      {/* Pixelated Clouds Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <PixelatedClouds />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1">{renderTab()}</main>
        <Footer />
      </div>
      
      {/* Pixelated Grass at Bottom */}
      <PixelatedGrass />
      
      <RegistrationModal open={showRegistration} onClose={() => setShowRegistration(false)} />
    </div>
  );
};

export default Index;
