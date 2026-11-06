import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Send,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  submitOrganizerRequest,
  subscribeOrganizerRequest,
} from '../lib/firestoreService';
import { OrganizerRequest } from '../types/initiative';

interface BecomeOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const BecomeOrganizerModal: React.FC<BecomeOrganizerModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [existingRequest, setExistingRequest] = useState<OrganizerRequest | null>(null);
  const [organizationOrBarangay, setOrganizationOrBarangay] = useState('');
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to user's organizer request status
  useEffect(() => {
    if (!user || !isOpen) return;

    setPhone(user.phone || '');
    const unsubscribe = subscribeOrganizerRequest(user.uid, (req) => {
      setExistingRequest(req);
    });

    return () => unsubscribe();
  }, [user?.uid, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationOrBarangay.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await submitOrganizerRequest(
        user.uid,
        user.displayName,
        user.email,
        phone.trim() || user.phone,
        organizationOrBarangay.trim(),
        reason.trim()
      );
      onShowToast('Organizer application submitted for review!');
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight">Become a Sandigan Organizer</h3>
                <p className="text-xs text-emerald-100">
                  Lead community drives across Cagayan de Oro & Bukidnon
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
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">
          {/* Status Banners */}
          {existingRequest && existingRequest.status === 'pending' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <h4 className="font-bold text-sm">Application Pending Review</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your request to become an organizer for{' '}
                <strong>{existingRequest.organizationOrBarangay}</strong> was submitted on{' '}
                {new Date(existingRequest.submittedAt).toLocaleDateString()}. Sandigan administrators
                review submissions within 24 hours.
              </p>
            </div>
          )}

          {existingRequest && existingRequest.status === 'approved' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <h4 className="font-bold text-sm">You are an Approved Organizer!</h4>
              </div>
              <p className="text-xs text-emerald-800">
                You now have full permission to post community drives, view real-time volunteer rosters, and check in attendees.
              </p>
            </div>
          )}

          {existingRequest && existingRequest.status === 'rejected' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <h4 className="font-bold text-sm">Application Not Approved</h4>
              </div>
              <p className="text-xs text-rose-800">
                You can re-apply below with updated community organization and mission details.
              </p>
            </div>
          )}

          {/* Organizer Benefits Strip */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Organizer Capabilities</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Publish and broadcast verified community initiatives</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Access the Operations Desk & Live Attendance Roster</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Issue verified volunteerism certificates</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          {(!existingRequest || existingRequest.status === 'rejected') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Community Group, School, or Barangay
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organizationOrBarangay}
                    onChange={(e) => setOrganizationOrBarangay(e.target.value)}
                    placeholder="e.g. Barangay Macasandig Youth Council / CDO Ocean Care"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Why would you like to lead initiatives on Sandigan?
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us about the grassroots causes, coastal cleanups, tree plantings, or relief drives you plan to organize..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Organizer Request'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
