import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import {
  FolderIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications');
        setUnreadCount(data.filter(n => !n.read_at).length);
      } catch (err) { }
    };
    if (user) fetchUnread();
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role?.name?.toLowerCase();

  const adminLinks = [
    { name: 'Projets', path: '/admin/projets', icon: FolderIcon },
    { name: 'Utilisateurs', path: '/admin/utilisateurs', icon: UsersIcon },
    { name: 'Suivi des Tâches', path: '/admin/suivi', icon: ClipboardDocumentCheckIcon },
    { name: 'Notifications', path: '/admin/notifications', icon: BellIcon },
  ];

  const userLinks = [
    { name: 'Mes Projets', path: '/user/projets', icon: FolderIcon },
    { name: 'Notifications', path: '/user/notifications', icon: BellIcon },
  ];

  const supervisorLinks = [
    { name: 'Suivi des Tâches', path: '/supervisor/suivi', icon: ClipboardDocumentCheckIcon },
    { name: 'Notifications', path: '/supervisor/notifications', icon: BellIcon },
  ];

  let links = [];
  if (role === 'admin') links = adminLinks;
  else if (role === 'user') links = userLinks;
  else if (role === 'supervisor') links = supervisorLinks;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-md shadow-lg text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg flex flex-col transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800 tracking-wider">GESTION <span className="text-blue-600">PROJETS</span></h1>
          <p className="text-xs text-gray-500 mt-1">Connecté en tant que: <span className="font-semibold text-gray-700">{user?.nom} ({role})</span></p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.name}
              {link.name === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
