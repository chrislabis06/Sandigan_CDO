/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Compass,
  Sparkles,
  MapPin,
  Heart,
  Share2,
  Calendar,
  Layers,
  ArrowUpDown,
  Flame,
  Map as MapIcon,
  LayoutGrid,
  AlertTriangle,
} from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AiAssistant } from './components/AiAssistant';
import { InitiativeCard } from './components/InitiativeCard';
import { InitiativeDetailModal } from './components/InitiativeDetailModal';
import { CreateInitiativeModal } from './components/CreateInitiativeModal';
import { MyDrivesDrawer } from './components/MyDrivesDrawer';
import { AnimationShowcaseModal } from './components/AnimationShowcaseModal';
import { VolunteerPassModal } from './components/VolunteerPassModal';
import { VolunteerCertificateModal } from './components/VolunteerCertificateModal';
import { OrganizerDeskModal } from './components/OrganizerDeskModal';
import { DriveChatDrawer } from './components/DriveChatDrawer';
import { BecomeOrganizerModal } from './components/BecomeOrganizerModal';
import { AdminControlCenterModal } from './components/AdminControlCenterModal';
import { ExploreMap } from './components/ExploreMap';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Toast } from './components/Toast';
import { Initiative, InitiativeCategory } from './types/initiative';
import { DEFAULT_INITIATIVES } from './data/defaultInitiatives';
import { AuthProvider, useAuth } from './lib/auth';
import {
  seedInitialDrivesIfEmpty,
  subscribeInitiatives,
  createInitiative,
  toggleJoinInitiative,
  subscribeRegistrations,
  addInitiativeComment,
} from './lib/firestoreService';

function SandiganMain() {
  const { user, isOrganizer, isAdmin } = useAuth();

  // Initiatives real-time Firestore state
  const [initiatives, setInitiatives] = useState<Initiative[]>(DEFAULT_INITIATIVES);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'upcoming' | 'spots' | 'popular'>('upcoming');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefillForCreate, setPrefillForCreate] = useState<Partial<Initiative> | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [isMyDrivesOpen, setIsMyDrivesOpen] = useState(false);
  const [isAnimationLabOpen, setIsAnimationLabOpen] = useState(false);

  // Community & Role Modals
  const [isBecomeOrgOpen, setIsBecomeOrgOpen] = useState(false);
  const [isAdminCenterOpen, setIsAdminCenterOpen] = useState(false);
  const [chatInitiative, setChatInitiative] = useState<Initiative | null>(null);

  // Auth & Profile Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Operational MVP Modals
  const [passInitiative, setPassInitiative] = useState<Initiative | null>(null);
  const [certificateData, setCertificateData] = useState<{
    initiative: Initiative | null;
    volunteerName: string;
  }>({ initiative: null, volunteerName: 'Volunteer Advocate' });
  const [organizerDeskInitiative, setOrganizerDeskInitiative] = useState<Initiative | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Initialize Firestore & Subscribe to real-time initiatives
  useEffect(() => {
    seedInitialDrivesIfEmpty().catch((err) =>
      console.warn('Seed initialization error (transient):', err)
    );

    const unsubscribe = subscribeInitiatives((items) => {
      if (items && items.length > 0) {
        setInitiatives(items);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time subscription to authenticated user's registrations
  useEffect(() => {
    if (!user?.uid) {
      setJoinedIds([]);
      return;
    }

    const unsubscribe = subscribeRegistrations(user.uid, (regs) => {
      setJoinedIds(regs.map((r) => r.initiativeId));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 3. Google Maps API Quota exceeded listener
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Helper: check if a drive is joined by current user
  const isDriveJoined = (drive: Initiative) => {
    if (user?.uid) {
      if (joinedIds.includes(drive.id)) return true;
      if (drive.joinedUserIds && drive.joinedUserIds.includes(user.uid)) return true;
    }
    return false;
  };

  // Handle joining or unregistering bound directly to Firestore
  const handleToggleJoin = async (id: string) => {
    const targetDrive = initiatives.find((i) => i.id === id);
    if (!targetDrive) return;

    if (!user) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      setToastMessage('Please sign in to register and bind this volunteer pass!');
      return;
    }

    const isCurrentlyJoined = isDriveJoined(targetDrive);

    // Optimistic local feedback
    setJoinedIds((prev) =>
      isCurrentlyJoined ? prev.filter((item) => item !== id) : [...prev, id]
    );

    try {
      await toggleJoinInitiative(id, user, isCurrentlyJoined);
      setToastMessage(
        isCurrentlyJoined
          ? `You have unregistered from "${targetDrive.title}".`
          : `Mabuhay! You've joined "${targetDrive.title}". See details for rendezvous point!`
      );
    } catch (err: any) {
      console.error('Failed to toggle join registration:', err);
      // Revert optimistic state on error
      setJoinedIds((prev) =>
        isCurrentlyJoined ? [...prev, id] : prev.filter((item) => item !== id)
      );
      setToastMessage('Could not update registration. Please check your network connection.');
    }
  };

  // Add new initiative via Firestore
  const handleAddInitiative = async (
    data: Omit<Initiative, 'id' | 'createdAt' | 'comments' | 'joined' | 'joinedUserIds'>
  ) => {
    try {
      const newId = await createInitiative(data, user);
      setToastMessage(`Initiative "${data.title}" successfully published!`);
      return newId;
    } catch (err: any) {
      console.error('Error creating initiative:', err);
      setToastMessage('Failed to publish initiative. Please check permissions.');
    }
  };

  // Direct publish from Gemini Assistant
  const handleDirectPublish = (
    data: Omit<Initiative, 'id' | 'createdAt' | 'comments' | 'joined' | 'joinedUserIds'>
  ) => {
    if (!user) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      setToastMessage('Please sign in or create an account to publish initiatives.');
      return;
    }
    if (!isOrganizer && !isAdmin) {
      setIsBecomeOrgOpen(true);
      setToastMessage('Organizer verification is required to publish initiatives.');
      return;
    }
    handleAddInitiative(data);
  };

  // Open creation modal with AI prefill
  const handleOpenWithPrefill = (prefill: Partial<Initiative>) => {
    if (!user) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      setToastMessage('Please sign in or join to create an initiative.');
      return;
    }
    if (!isOrganizer && !isAdmin) {
      setIsBecomeOrgOpen(true);
      setToastMessage('Organizer status required to post community drives.');
      return;
    }
    setPrefillForCreate(prefill);
    setIsCreateModalOpen(true);
  };

  // Header "New Initiative" click handler with role guidance
  const handleHeaderCreateClick = () => {
    if (!user) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      setToastMessage('Please sign in or join to create an initiative.');
      return;
    }

    if (!isOrganizer && !isAdmin) {
      // Guide regular volunteer to apply for organizer status
      setIsBecomeOrgOpen(true);
      setToastMessage('Apply to become a Verified Organizer to launch community drives!');
      return;
    }

    setPrefillForCreate(null);
    setIsCreateModalOpen(true);
  };

  // Add comment / Q&A update via Firestore
  const handleAddComment = async (initiativeId: string, author: string, text: string) => {
    const commentAuthor = user?.displayName || author || 'Volunteer Advocate';
    try {
      await addInitiativeComment(initiativeId, commentAuthor, text);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setToastMessage('Could not post comment. Please try again.');
    }
  };

  // Filtered & sorted initiatives
  const filteredInitiatives = initiatives
    .filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (regionFilter !== 'All' && item.region !== regionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesOrg = item.organizerName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesDesc && !matchesOrg) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'spots') {
        return a.capacity - a.joined - (b.capacity - b.joined);
      }
      if (sortBy === 'popular') {
        return b.joined - a.joined;
      }
      return b.createdAt - a.createdAt;
    });

  // Calculate stats
  const totalDrives = initiatives.length;
  const totalJoined = initiatives.reduce((sum, item) => sum + item.joined, 0);
  const totalCapacity = initiatives.reduce((sum, item) => sum + item.capacity, 0);

  // Drives bound to authenticated user
  const userJoinedInitiatives = initiatives.filter((item) => isDriveJoined(item));

  const categories: ('All' | InitiativeCategory)[] = [
    'All',
    'Environment',
    'Education',
    'Disaster Response',
    'Community Relief',
    'Health',
    'Animal Welfare',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Sticky Quota Warning Banner per Google Maps Guidelines */}
      {quotaExceeded && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs sticky top-0 z-50">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Google Maps API daily quota reached. Standard interactive features may be limited until reset.
          </span>
        </div>
      )}

      {/* HEADER WITH DYNAMIC AUTH AND ROLE NAVIGATION */}
      <Header
        onOpenCreateModal={handleHeaderCreateClick}
        onOpenMyDrives={() => setIsMyDrivesOpen(true)}
        myDrivesCount={userJoinedInitiatives.length}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenBecomeOrganizer={() => setIsBecomeOrgOpen(true)}
        onOpenAdminCenter={() => setIsAdminCenterOpen(true)}
        onToggleMapView={() => setViewMode((prev) => (prev === 'cards' ? 'map' : 'cards'))}
        isMapView={viewMode === 'map'}
      />

      {/* MAIN VIEW */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow space-y-10 sm:space-y-12">
        {/* HERO SECTION */}
        <Hero
          totalDrives={totalDrives}
          totalJoined={totalJoined}
          totalCapacity={totalCapacity}
        />

        {/* AI PROMPT ASSISTANT */}
        <AiAssistant
          onDirectPublish={handleDirectPublish}
          onOpenWithPrefill={handleOpenWithPrefill}
        />

        {/* INITIATIVES FEED SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Active Community Drives
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {filteredInitiatives.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Grassroots initiatives looking for volunteers today in Cagayan de Oro and Bukidnon.
              </p>
            </div>

            {/* View Switcher & Animation Lab */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Cards vs Interactive Map View Switcher */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'cards'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'map'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Interactive Map</span>
                </button>
              </div>

              {/* Quick action: Open Motion Lab button */}
              <button
                onClick={() => setIsAnimationLabOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800 transition shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Animation Lab</span>
              </button>
            </div>
          </div>

          {/* Search, Region, and Filters Toolbar */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drives by name, beach, school, or landmark..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </div>

            {/* Region Dropdown & Sort */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  <option value="Cagayan de Oro">Cagayan de Oro</option>
                  <option value="Misamis Oriental">Misamis Oriental</option>
                  <option value="Bukidnon">Bukidnon</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer"
                >
                  <option value="upcoming">Recently Added</option>
                  <option value="spots">Fewest Spots Left (Urgent)</option>
                  <option value="popular">Most Volunteers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* VIEW SWITCHER CONTENT: INTERACTIVE GOOGLE MAP OR CARDS GRID */}
          {viewMode === 'map' ? (
            <div className="space-y-4">
              <ExploreMap
                initiatives={filteredInitiatives}
                selectedInitiative={selectedInitiative}
                onSelectInitiative={(init) => setSelectedInitiative(init)}
                userJoinedIds={joinedIds}
                onOpenChat={(init) => setChatInitiative(init)}
              />
              <p className="text-xs text-slate-500 text-center">
                Click any active pin on the map to preview rendezvous details, volunteer progress, and directions. Toggle between "All Community Drives" and "My Registered Drives" above.
              </p>
            </div>
          ) : filteredInitiatives.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                No initiatives match your filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or post a new drive using the Gemini Prompt Assistant above!
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setRegionFilter('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInitiatives.map((item) => (
                <InitiativeCard
                  key={item.id}
                  initiative={item}
                  isUserJoined={isDriveJoined(item)}
                  onToggleJoin={handleToggleJoin}
                  onOpenDetails={(init) => setSelectedInitiative(init)}
                  onOpenChat={(init) => setChatInitiative(init)}
                  onViewOnMap={(init) => {
                    setViewMode('map');
                    setSelectedInitiative(init);
                  }}
                  onShowToast={(msg) => setToastMessage(msg)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs sm:text-sm text-slate-500">
        <p className="font-semibold text-slate-800">
          Sandigan · Grassroots Civic Bayanihan Network
        </p>
      </footer>

      {/* DETAIL MODAL */}
      <InitiativeDetailModal
        initiative={selectedInitiative}
        onClose={() => setSelectedInitiative(null)}
        isUserJoined={selectedInitiative ? isDriveJoined(selectedInitiative) : false}
        onToggleJoin={handleToggleJoin}
        onAddComment={handleAddComment}
        onOpenVolunteerPass={(init) => setPassInitiative(init)}
        onOpenOrganizerDesk={(init) => setOrganizerDeskInitiative(init)}
        onOpenChat={(init) => setChatInitiative(init)}
        onViewOnMap={(init) => {
          setViewMode('map');
          setSelectedInitiative(init);
        }}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* VOLUNTEER PASS MODAL WITH AUTO-FILLED PROFILE & SCANNABLE QR */}
      <VolunteerPassModal
        initiative={passInitiative}
        isOpen={Boolean(passInitiative)}
        onClose={() => setPassInitiative(null)}
        onOpenCertificate={(init, vName) => {
          setCertificateData({ initiative: init, volunteerName: vName });
        }}
        onShowToast={(msg) => setToastMessage(msg)}
        onOpenAuthModal={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }}
      />

      {/* VOLUNTEER CERTIFICATE MODAL */}
      <VolunteerCertificateModal
        initiative={certificateData.initiative}
        volunteerName={certificateData.volunteerName}
        isOpen={Boolean(certificateData.initiative)}
        onClose={() =>
          setCertificateData({ initiative: null, volunteerName: 'Volunteer Advocate' })
        }
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* ORGANIZER OPERATIONS DESK WITH LIVE ROSTER */}
      <OrganizerDeskModal
        initiative={organizerDeskInitiative}
        isOpen={Boolean(organizerDeskInitiative)}
        onClose={() => setOrganizerDeskInitiative(null)}
        onBroadcastAnnouncement={(id, msg) => {
          handleAddComment(id, 'Lead Coordinator (Bulletin)', msg);
        }}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* BECOME AN ORGANIZER APPLICATION MODAL */}
      <BecomeOrganizerModal
        isOpen={isBecomeOrgOpen}
        onClose={() => setIsBecomeOrgOpen(false)}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* ADMIN CONTROL CENTER MODAL */}
      <AdminControlCenterModal
        isOpen={isAdminCenterOpen}
        onClose={() => setIsAdminCenterOpen(false)}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* REAL-TIME DRIVE SQUAD CHAT DRAWER */}
      <DriveChatDrawer
        initiative={chatInitiative}
        isOpen={Boolean(chatInitiative)}
        onClose={() => setChatInitiative(null)}
        onOpenAuthModal={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }}
      />

      {/* CREATE INITIATIVE MODAL */}
      <CreateInitiativeModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPrefillForCreate(null);
        }}
        onSubmit={handleAddInitiative}
        prefillData={prefillForCreate}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* MY DRIVES DRAWER BOUND TO CURRENT USER UID */}
      <MyDrivesDrawer
        isOpen={isMyDrivesOpen}
        onClose={() => setIsMyDrivesOpen(false)}
        allInitiatives={initiatives}
        joinedInitiatives={userJoinedInitiatives}
        onUnjoin={handleToggleJoin}
        onOpenDetails={(init) => {
          setIsMyDrivesOpen(false);
          setSelectedInitiative(init);
        }}
        onOpenPass={(init) => {
          setIsMyDrivesOpen(false);
          setPassInitiative(init);
        }}
        onOpenChat={(init) => {
          setIsMyDrivesOpen(false);
          setChatInitiative(init);
        }}
        onViewOnMap={(init) => {
          setIsMyDrivesOpen(false);
          setViewMode('map');
          setSelectedInitiative(init);
        }}
        onOpenAuthModal={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }}
      />

      {/* AUTH MODAL (SIGN IN / SIGN UP / GOOGLE 1-CLICK) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      {/* USER PROFILE MODAL */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* ANIMATION & MICRO-INTERACTIONS SHOWCASE LAB */}
      <AnimationShowcaseModal
        isOpen={isAnimationLabOpen}
        onClose={() => setIsAnimationLabOpen(false)}
      />

      {/* TOAST NOTIFICATION */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SandiganMain />
    </AuthProvider>
  );
}
