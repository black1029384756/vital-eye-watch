
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface HeaderProps {
  onSearchChange?: (query: string) => void;
}

export function Header({ onSearchChange }: HeaderProps) {
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/c8c119c3-cebe-44f9-854e-9fc81ff61dc3.png" alt="Delphi TVS Technologies" className="h-10" />
          </Link>
          <h1 className="ml-6 text-xl font-semibold text-delphi-500 hidden sm:inline-block">
            Hostage Monitoring System
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-48 md:w-64">
            <Input
              type="search"
              placeholder="Search..."
              className="pr-8"
              onChange={handleSearchInput}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <nav className="flex items-center space-x-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Link to="/admin">
              <Button variant="default" size="sm">Admin</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
