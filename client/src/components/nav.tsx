import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, PlusCircle } from "lucide-react";

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">ORM Builder</span>
            </a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className={cn(
                "px-3 py-2 rounded-md text-sm font-medium",
                location === "/" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
              )}>
                Tests
              </a>
            </Link>
            <Link href="/create">
              <a className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1",
                location === "/create" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
              )}>
                <PlusCircle className="h-4 w-4" />
                <span>Create</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
