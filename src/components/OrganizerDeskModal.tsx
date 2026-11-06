import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CheckCircle2,
  Calendar,
  MapPin,
  Megaphone,
  Download,
  Search,
  Check,
  UserCheck,
  AlertCircle,
  Phone,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { Initiative, Registration } from '../types/initiative';
import {
  subscribeRegistrations,
  setRegistrationCheckIn,
  addInitiativeComment,
} from '../lib/firestoreService';
import { useAuth } from '../lib/auth';

interface OrganizerDeskModalProps {
  initiative: Initiative | null;
  isOpen: boolean;
  onClose: () => void;
  onBroadcastAnnouncement?: (initiativeId: string, message: string) => void;
  onShowToast: (message: string) => void;
}

export const OrganizerDeskModal: React.FC<OrganizerDeskModalProps> = ({
  initiative,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Subscribe to real-time volunteer registrations for this initiative
  useEffect(() => {
    if (!isOpen || !initiative) return;

    const unsubscribe = subscribeRegistrations(initiative.id, (list) => {
      setRegistrations(list);
    });

    return () => unsubscribe();
  }, [isOpen, initiative?.id]);

  if (!isOpen || !initiative) return null;

  const handleToggleCheckIn = async (reg: Registration) => {
    const nextState = !reg.checkedIn;
    try {
      await setRegistrationCheckIn(reg.id, nextState);
      onShowToast(
        nextState
          ? `${reg.userName} marked as checked-in!`
          : `${reg.userName} check-in revoked.`
      );
    } catch (err: any) {
      onShowToast('Could not update check-in: ' + err?.message);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() || !user) return;

    setIsBroadcasting(true);
    try {
      const msg = `[ORGANIZER ANNOUNCEMENT] ${announcementText.trim()}`;
      await addInitiativeComment(initiative.id, `${user.displayName} (Lead Organizer)`, user.uid, msg);
      onShowToast('Announcement broadcasted to community feed!');
      setAnnouncementText('');
    } catch (err: any) {
      onShowToast('Failed to broadcast: ' + err?.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Export roster to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      onShowToast('No volunteers registered yet to export.');
      return;
    }

    const headers = ['Volunteer Name', 'Email', 'Phone', 'Blood Type', 'Attendance Status', 'Registered Time'];
    const rows = registrations.map((r) => [
      `"${r.userName}"`,
      `"${r.userEmail || ''}"`,
      `"${r.userPhone || ''}"`,
      `"${r.userBloodType || 'O+'}"`,
      r.checkedIn ? 'Checked-In' : 'Registered',
      `"${new Date(r.registeredAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sandigan_Roster_${initiative.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Volunteer roster CSV exported.');
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      (r.userEmail && r.userEmail.toLowerCase().includes(q)) ||
      (r.userPhone && r.userPhone.includes(q))
    );
  });

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const totalRegistered = registrations.length;
  const attendanceRate = totalRegistered > 0 ? Math.round((checkedInCount / totalRegistered) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Organizer Operations Desk
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Live Firestore Roster</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight truncate mt-1">
                {initiative.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Attendance Metric Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Registered
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalRegistered}</div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              On-Site Checked In
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">{checkedInCount}</div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Rate
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600">{attendanceRate}%</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white text-slate-700">
          {/* Broadcast Announcement Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2.5">
            <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Broadcast Announcement to Volunteers</span>
            </h4>
            <form onSubmit={handleBroadcast} className="flex gap-2">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Please assemble at Gate 2 due to light morning drizzle..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!announcementText.trim() || isBroadcasting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 shrink-0"
              >
                {isBroadcasting ? 'Broadcasting...' : 'Broadcast'}
              </button>
            </form>
          </div>

          {/* Search & Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered volunteers by name, email, or phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Roster CSV</span>
            </button>
          </div>

          {/* Roster Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            {filteredRegistrations.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-slate-50">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <h5 className="font-bold text-xs text-slate-700">No Volunteers Found</h5>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {totalRegistered === 0
                    ? 'Volunteers who tap "Join & Volunteer" in Sandigan will appear here in real-time.'
                    : 'No registered volunteers match your search filter.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          reg.checkedIn
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {reg.userName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {reg.userName}
                          </span>
                          {reg.userBloodType && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                              {reg.userBloodType}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 truncate">
                          <span>{reg.userPhone || '0917-000-0000'}</span>
                          <span>•</span>
                          <span className="truncate">{reg.userEmail || 'Volunteer'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCheckIn(reg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        reg.checkedIn
                          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200'
                      }`}
                    >
                      {reg.checkedIn ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Checked In</span>
                        </>
                      ) : (
                        <span>Check In</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Assembly Rendezvous: <strong>{initiative.meetPoint || initiative.location}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
};
