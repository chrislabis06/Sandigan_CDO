import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Check,
  XCircle,
  Users,
  Building,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  subscribeAllOrganizerRequests,
  reviewOrganizerRequest,
} from '../lib/firestoreService';
import { OrganizerRequest } from '../types/initiative';

interface AdminControlCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const AdminControlCenterModal: React.FC<AdminControlCenterModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Subscribe to all organizer applications in real time
  useEffect(() => {
    if (!isOpen || !user) return;

    const unsubscribe = subscribeAllOrganizerRequests((list) => {
      setRequests(list);
    });

    return () => unsubscribe();
  }, [isOpen, user?.uid]);

  if (!isOpen || !user) return null;

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const displayedRequests = activeTab === 'pending' ? pendingRequests : requests;

  const handleReview = async (
    reqId: string,
    targetUserId: string,
    status: 'approved' | 'rejected'
  ) => {
    setActionInProgress(reqId);
    try {
      await reviewOrganizerRequest(reqId, targetUserId, status, user.uid);
      onShowToast(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to update request.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                  Admin Control Center
                </h3>
                <p className="text-xs text-indigo-200">
                  Manage organizer applications, role elevations, and civic access
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Pending Reviews ({pendingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              All Submissions ({requests.length})
            </button>
          </div>
        </div>

        {/* Content Stream */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {displayedRequests.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {activeTab === 'pending' ? 'No Pending Applications' : 'No Submissions Found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'pending'
                  ? 'All organizer verification requests have been addressed!'
                  : 'Organizer requests from volunteers will populate here in real-time.'}
              </p>
            </div>
          ) : (
            displayedRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{req.userName}</h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{req.organizationOrBarangay}</span>
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                {/* Reason Details */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                  <p className="font-semibold text-slate-900 mb-0.5">Motivation & Plan:</p>
                  <p>{req.reason}</p>
                </div>

                {/* Contact Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.phone || 'No phone'}</span>
                  </div>
                </div>

                {/* Action Buttons for Pending */}
                {req.status === 'pending' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={actionInProgress === req.id}
                      onClick={() => handleReview(req.id, req.userId, 'rejected')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionInProgress === req.id}
                      onClick={() => handleReview(req.id, req.userId, 'approved')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve as Organizer</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Active Administrator: <strong>{user.email}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
