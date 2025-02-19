
import * as React from "react";
import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <nav className="fixed top-0 w-full bg-white/60 backdrop-blur-xl border-b border-green-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary hover:text-accent transition-colors">
              FitCoach
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            <Link
              to="/dashboard"
              className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/clients"
              className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Clients
            </Link>
            <Link
              to="/programs"
              className="text-primary hover:text-accent hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Programs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
