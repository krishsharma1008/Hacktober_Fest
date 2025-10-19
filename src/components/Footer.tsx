import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card/90 backdrop-blur-sm border-t-4 border-primary mt-20 relative z-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Link 
            to="/pacman-game"
            className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 bg-accent shadow-medium flex items-center justify-center font-retro text-xs text-accent-foreground">
              Z
            </div>
            <div className="text-left">
              <div className="font-retro text-sm">Zapminds</div>
              <div className="text-xs text-muted-foreground font-sans">Innovation by Zapcom</div>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
};
