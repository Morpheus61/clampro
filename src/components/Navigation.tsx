import React from 'react';
import { Menu, Shell, Package, FileText, Settings, Scale } from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Navigation({ activeView, onNavigate }: NavigationProps) {
  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shell className="w-8 h-8" />
            <span className="text-xl font-bold">ClamFlow™</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <NavLink
              icon={<Package />}
              text="Raw Material"
              isActive={activeView === 'raw' || activeView === 'receipts'}
              onClick={() => onNavigate('receipts')}
            />
            <NavLink
              icon={<FileText />}
              text="Processing"
              isActive={activeView === 'processing'}
              onClick={() => onNavigate('processing')}
            />
            <NavLink
              icon={<Scale />}
              text="Shell Weight"
              isActive={activeView === 'shells'}
              onClick={() => onNavigate('shells')}
            />
            <NavLink
              icon={<Menu />}
              text="Dashboard"
              isActive={activeView === 'dashboard'}
              onClick={() => onNavigate('dashboard')}
            />
            <NavLink
              icon={<Settings />}
              text="Admin"
              isActive={activeView === 'admin'}
              onClick={() => onNavigate('admin')}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick: () => void;
}

function NavLink({ icon, text, isActive, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-indigo-700 text-white' 
          : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
        }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}