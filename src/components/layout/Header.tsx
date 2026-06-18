import { Bell, Search, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-warm-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 hover:bg-warm-100 rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <h2 className="text-lg font-semibold text-warm-900">{title}</h2>
          {subtitle && <p className="text-sm text-warm-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-warm-100/50 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-warm-400" />
          <input
            type="text"
            placeholder="搜索宠物、药品..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-warm-700 placeholder-warm-400"
          />
        </div>

        <button className="relative p-2 hover:bg-warm-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-warm-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
