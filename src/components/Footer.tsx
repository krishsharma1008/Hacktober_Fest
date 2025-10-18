export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground">
                Z
              </div>
              <div>
                <div className="font-bold text-lg">Zapminds</div>
                <div className="text-sm text-muted-foreground">Innovation by Zapcom</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Building the future of technology through innovation and collaboration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#overview" className="hover:text-primary transition-colors">Overview</a></li>
              <li><a href="#participants" className="hover:text-primary transition-colors">Participants</a></li>
              <li><a href="#rules" className="hover:text-primary transition-colors">Rules</a></li>
              <li><a href="#gallery" className="hover:text-primary transition-colors">Project Gallery</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:zapminds@zapcomgroup.com" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Code of Conduct</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Built with ❤️ at Zapcom © {new Date().getFullYear()} Zapminds. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
