import { Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-24 bg-card/40">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
              <Sprout className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Aislemind</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            A marketplace for considered objects — built by independent makers,
            grown in the spirit of slow craft and modern rural living.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Marketplace</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">All products</Link></li>
            <li><Link to="/?cat=Home" className="hover:text-primary">Home</Link></li>
            <li><Link to="/?cat=Fashion" className="hover:text-primary">Fashion</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Sell on Aislemind</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth?role=vendor" className="hover:text-primary">Become a vendor</Link></li>
            <li><Link to="/support" className="hover:text-primary">Support</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aislemind. Made with care.
      </div>
    </footer>
  );
}
