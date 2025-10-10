import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './Button';
import { DashboardIcon, MeasurementIcon, WardrobeIcon, SparklesIcon, LogoutIcon } from './Icons';

export const Navigation = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center space-x-3">
              <div className="p-2 bg-gradient-fashion rounded-xl">
                <SparklesIcon size="md" className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FITON
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Your personal style companion</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <DashboardIcon size="sm" className="mr-2" />
              Dashboard
            </Link>
            <Link
              to="/measurements"
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/measurements')
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <MeasurementIcon size="sm" className="mr-2" />
              Measurements
            </Link>
            <Link
              to="/wardrobe"
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/wardrobe')
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <WardrobeIcon size="sm" className="mr-2" />
              Wardrobe
            </Link>
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back</p>
              <p className="font-semibold text-gray-900">{user?.username || user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-600"
            >
              <LogoutIcon size="sm" className="mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 border-t border-gray-200/50">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <DashboardIcon size="sm" className="mr-3" />
                Dashboard
              </Link>
              <Link
                to="/measurements"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive('/measurements')
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <MeasurementIcon size="sm" className="mr-3" />
                Measurements
              </Link>
              <Link
                to="/wardrobe"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive('/wardrobe')
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <WardrobeIcon size="sm" className="mr-3" />
                Wardrobe
              </Link>
              <div className="pt-3 border-t border-gray-200/50 mt-3">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-500">Welcome back</p>
                  <p className="font-semibold text-gray-900">{user?.username || user?.email}</p>
                </div>
                <div className="px-3">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 hover:text-red-600"
                  >
                    <LogoutIcon size="sm" className="mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};