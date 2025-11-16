import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, LogOut, Home, Search, Beaker, FileText, MessageSquare, Star, UserCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationProps {
  userType: "patient" | "researcher";
  onLogout?: () => void;
  onChangeAccountType?: () => void;
}

export function Navigation({ userType, onLogout, onChangeAccountType }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const patientLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/experts", label: "Find Experts", icon: Search },
    { href: "/trials", label: "Clinical Trials", icon: Beaker },
    { href: "/publications", label: "Publications", icon: FileText },
    { href: "/forums", label: "Forums", icon: MessageSquare },
    { href: "/favourites", label: "Favourites", icon: Star },
  ];

  const researcherLinks = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/myresearch", label: "My Research Page", icon: FileText },
    { href: "/experts", label: "Find Collaboration", icon: Search },
    { href: "/trials", label: "Clinical Trials", icon: Beaker },
    { href: "/publications", label: "Publications", icon: FileText },
    { href: "/forums", label: "Forums", icon: MessageSquare },
    { href: "/favourites", label: "Favourites", icon: Star },
  ];

  const links = userType === "patient" ? patientLinks : researcherLinks;

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Menu Button & Logo */}
          <div className="flex items-center gap-3">
            {location.pathname !== "/dashboard" && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">C</span>
                    </div>
                    CuraLink
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg mb-4">
                    <User className="h-4 w-4" />
                    <span className="text-sm capitalize">{userType}</span>
                  </div>
                  
                  {links.map((link) => (
                    <Link
                      key={link.href + link.label}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted",
                        location.pathname === link.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}

                  <div className="border-t pt-2 mt-2">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      My Profile
                    </Link>
                    
                    {onChangeAccountType && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3"
                        onClick={() => {
                          setOpen(false);
                          onChangeAccountType();
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Change Account Type
                      </Button>
                    )}

                    {onLogout && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3"
                        onClick={() => {
                          setOpen(false);
                          onLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl">CuraLink</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <User className="h-4 w-4" />
              <span className="text-sm capitalize">{userType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
