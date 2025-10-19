import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { UpdatesTab } from "@/components/tabs/UpdatesTab";

const Updates = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationHeader />
      <main className="flex-1">
        <UpdatesTab />
      </main>
      <Footer />
    </div>
  );
};

export default Updates;

