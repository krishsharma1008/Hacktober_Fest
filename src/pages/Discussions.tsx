import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { DiscussionsTab } from "@/components/tabs/DiscussionsTab";

const Discussions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <main className="flex-1">
        <DiscussionsTab />
      </main>
      <Footer />
    </div>
  );
};

export default Discussions;

