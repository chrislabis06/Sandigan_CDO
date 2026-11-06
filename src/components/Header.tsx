import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  BookmarkCheck,
  User,
  LogOut,
  ChevronDown,
  Settings,
  Shield,
  Heart,
  LogIn,
  Camera,
  Map as MapIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onOpenMyDrives: () => void;
  myDrivesCount: number;
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenProfileModal: () => void;
  onOpenBecomeOrganizer?: () => void;
  onOpenAdminCenter?: () => void;
  onToggleMapView?: () => void;
  isMapView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onOpenMyDrives,
  myDrivesCount,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenBecomeOrganizer,
  onOpenAdminCenter,
  onToggleMapView,
  isMapView = false,
}) => {
  const { user, isAdmin, isOrganizer, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm ring-2 ring-emerald-600/20">
            S
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight">
              Sandigan
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 hidden sm:block tracking-wide uppercase">
              Grassroots Bayanihan Hub
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AI Engine Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gemini AI Engine Active</span>
          </div>

          {/* Admin Control Center Button (for admin users) */}
          {isAdmin && onOpenAdminCenter && (
            <button
              onClick={onOpenAdminCenter}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-xs"
              title="Admin Control Center - Manage Organizer Applications"
            >
              <Shield className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Admin Center</span>
            </button>
          )}

          {/* Become Organizer (for regular volunteers) */}
          {user && !isOrganizer && !isAdmin && onOpenBecomeOrganizer && (
            <button
              onClick={onOpenBecomeOrganizer}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
              title="Apply to become a Verified Organizer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Become Organizer</span>
            </button>
          )}

          {/* Map View Toggle Button */}
          {onToggleMapView && (
            <button
              onClick={onToggleMapView}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs ${
                isMapView
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80'
              }`}
              title={isMapView ? 'Switch to Grid Cards view' : 'Switch to Interactive Map view'}
            >
              <MapIcon className={`w-4 h-4 ${isMapView ? 'text-white' : 'text-emerald-600'}`} />
              <span className="hidden sm:inline">{isMapView ? 'Cards View' : 'Explore Map'}</span>
            </button>
          )}

          {/* My Drives Button */}
          <button
            onClick={onOpenMyDrives}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
            title="View my registered volunteer drives"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden xs:inline">My Drives</span>
            {myDrivesCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold leading-none text-white bg-emerald-600 rounded-full">
                {myDrivesCount}
              </span>
            )}
          </button>

          {/* New Initiative Button */}
          <button
            onClick={onOpenCreateModal}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 ${
              isOrganizer || isAdmin
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title={isOrganizer || isAdmin ? 'Create a new grassroots drive' : 'Post or request an initiative'}
          >
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="hidden sm:inline">New Initiative</span>
            <span className="sm:hidden">Post</span>
          </button>

          {/* User Profile / Auth State Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition shadow-2xs"
                title="Account menu"
              >
                {/* User Avatar */}
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-emerald-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Display Name */}
                <div className="text-left hidden md:block">
                  <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[110px] truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold capitalize block leading-tight">
                    {user.role || 'volunteer'}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Header Card */}
                  <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="relative group cursor-pointer shrink-0"
                        title="Click to change profile picture"
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border-2 border-emerald-500 shadow-xs">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition">
                          <Camera className="w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                          {user.displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenProfileModal();
                          }}
                          className="mt-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>Change Photo</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {user.role || 'volunteer'}
                      </span>
                      {user.bloodType && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          Blood: {user.bloodType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1 text-xs text-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Edit Volunteer Profile & Pass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenMyDrives();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition font-medium"
                    >
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span>My Registered Drives ({myDrivesCount})</span>
                    </button>

                    {isAdmin && onOpenAdminCenter && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenAdminCenter();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-amber-50 flex items-center gap-2.5 transition font-bold text-amber-800"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>Admin Control Center</span>
                      </button>
                    )}

                    {!isOrganizer && !isAdmin && onOpenBecomeOrganizer && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenBecomeOrganizer();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-emerald-50 flex items-center gap-2.5 transition font-medium text-emerald-800"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Apply to Become an Organizer</span>
                      </button>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-Out State: Display a "Sign In / Join" button */
            <button
              onClick={() => onOpenAuthModal('signin')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
            >
              <LogIn className="w-4 h-4 text-emerald-700" />
              <span>Sign In / Join</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
