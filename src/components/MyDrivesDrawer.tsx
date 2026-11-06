import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  CalendarPlus,
  HeartHandshake,
  Trash2,
  LogIn,
  UserCheck,
  ShieldCheck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Initiative } from '../types/initiative';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import { useAuth, auth } from '../lib/auth';

interface MyDrivesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allInitiatives?: Initiative[];
  joinedInitiatives: Initiative[];
  onUnjoin: (id: string) => void;
  onOpenDetails: (initiative: Initiative) => void;
  onOpenPass: (initiative: Initiative) => void;
  onOpenChat?: (initiative: Initiative) => void;
  onViewOnMap?: (initiative: Initiative) => void;
  onOpenAuthModal?: () => void;
}

export const MyDrivesDrawer: React.FC<MyDrivesDrawerProps> = ({
  isOpen,
  onClose,
  allInitiatives = [],
  joinedInitiatives,
  onUnjoin,
  onOpenDetails,
  onOpenPass,
  onOpenChat,
  onViewOnMap,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();

  // Filter drives bound to the authenticated user (userId == auth.currentUser.uid or joinedUserIds contains uid)
  const currentUid = user?.uid || auth.currentUser?.uid;

  const boundDrives = React.useMemo(() => {
    if (!currentUid) {
      // If not logged in, return existing joinedInitiatives session items
      return joinedInitiatives;
    }

    if (allInitiatives.length > 0) {
      return allInitiatives.filter(
        (item) =>
          (item.joinedUserIds && item.joinedUserIds.includes(currentUid)) ||
          item.userId === currentUid ||
          joinedInitiatives.some((ji) => ji.id === item.id)
      );
    }

    return joinedInitiatives;
  }, [allInitiatives, joinedInitiatives, currentUid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">My Volunteer Drives</h3>
              <p className="text-xs text-slate-500">
                {boundDrives.length} active civic {boundDrives.length === 1 ? 'pledge' : 'pledges'}
                {user ? ` bound to your profile` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Session Status Banner */}
        {user ? (
          <div className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Active User: <strong>{user.displayName}</strong></span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 shrink-0">
              UID: {user.uid.slice(0, 10)}...
            </span>
          </div>
        ) : (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Sign in to permanently save your registrations across devices.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal?.();
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
            >
              Sign In
            </button>
          </div>
        )}

        {/* List of joined drives */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {boundDrives.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-700">No Volunteer Drives Yet</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Explore the community feed and tap "Tap to Join & Volunteer" on causes you care about in Cagayan de Oro & Bukidnon!
              </p>
              {!user && onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In or Create Account</span>
                </button>
              )}
            </div>
          ) : (
            boundDrives.map((item) => {
              const isOrganizer = user && item.userId === user.uid;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.category}
                      </span>
                      {isOrganizer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Lead Organizer
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.date}
                    </span>
                  </div>

                  <h4
                    onClick={() => onOpenDetails(item)}
                    className="font-bold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer transition line-clamp-1"
                  >
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.location}</span>
                  </p>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={getGoogleCalendarUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition"
                        title="Add to Google Calendar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {onViewOnMap && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onViewOnMap(item);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition"
                          title="Pinpoint on Map"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      )}
                      {onOpenChat && (
                        <button
                          type="button"
                          onClick={() => onOpenChat(item)}
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
                          title="Open Live Squad Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenPass(item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition flex items-center gap-1"
                        title="View Digital Pass & QR"
                      >
                        <span>Pass & QR</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUnjoin(item.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {boundDrives.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
            Thank you for living out the spirit of <span className="font-semibold text-emerald-700">Bayanihan</span>!
          </div>
        )}
      </div>
    </div>
  );
};
