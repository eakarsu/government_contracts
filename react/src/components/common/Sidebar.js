import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  FileText, 
  User, 
  Bookmark, 
  FolderOpen,
  X 
} from 'lucide-react';

const Sidebar = ({ open, setOpen }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Search Contracts', href: '/search', icon: Search },
    { name: 'Saved Searches', href: '/saved-searches', icon: Bookmark },
    { name: 'Applications', href: '/applications', icon: FolderOpen },
    { name: 'Company Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h2 className="text-xl font-semibold text-white">GovContract Pro</h2>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-r-4 border-blue-600' : ''}`
                }
                onClick={() => setOpen(false)}
              >
                <Icon className="mr-3" size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;