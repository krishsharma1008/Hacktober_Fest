import { useEffect, useRef } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PacManGame = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Set page title
    document.title = "Pac-Man Game - Hacktoberfest";
    
    // Focus the iframe after it loads so keyboard events work
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', () => {
        iframe.focus();
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-retro"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-retro text-primary mb-4">
              Pac-Man Game
            </h1>
            <p className="text-muted-foreground">
              Use arrow keys to move Pac-Man. Eat all the dots and power pellets while avoiding ghosts!
            </p>
          </div>

          <div className="bg-card rounded-lg border-4 border-primary p-8 shadow-xl">
            <div className="flex justify-center">
              <iframe
                ref={iframeRef}
                src="/pacman-game/index.html"
                title="Pac-Man Game"
                className="w-full h-[700px] border-0 rounded"
                style={{ maxWidth: "700px" }}
                tabIndex={0}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Click inside the game area, then use arrow keys to play
            </p>
          </div>

          <div className="mt-8 bg-card/50 rounded-lg border-2 border-primary/30 p-6">
            <h2 className="text-2xl font-retro text-primary mb-4">Game Instructions</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Use <strong>Arrow Keys</strong> (↑ ↓ ← →) to control Pac-Man</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Eat all the small dots to score points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Eat power pellets (large dots) to make ghosts vulnerable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>When ghosts turn aquamarine, you can eat them for bonus points!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Avoid the ghosts when they're in their normal colors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Win by eating all dots! Game over if a ghost catches you!</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PacManGame;

