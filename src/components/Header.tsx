
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface HeaderProps {
  onSearchChange?: (query: string) => void;
}

export function Header({ onSearchChange }: HeaderProps) {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const isDashboard = location.pathname === "/dashboard";

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const searchPlaceholder = isAdmin ? "Search employees by name..." : "Search...";

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/c8c119c3-cebe-44f9-854e-9fc81ff61dc3.png" alt="Delphi TVS Technologies" className="h-10" />
          </Link>
          <h1 className="ml-6 text-xl font-semibold text-delphi-700 hidden sm:inline-block">
            Hostage Monitoring System
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {(isAdmin || isDashboard) && (
            <div className="relative w-56 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-9"
                onChange={handleSearchInput}
              />
            </div>
          )}
          <nav className="flex items-center space-x-2">
            <Link to="/dashboard">
              <Button 
                variant={location.pathname.includes("/dashboard") ? "default" : "outline"} 
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/admin">
              <Button 
                variant={location.pathname === "/admin" ? "default" : "outline"} 
                size="sm"
              >
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
