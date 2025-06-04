import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 hover:text-gray-900">
            <Bell size={20} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1 py-0.5 text-xs text-white bg-red-500 rounded-full">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;