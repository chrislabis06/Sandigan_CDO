import React, { useState } from 'react';
import {
  X,
  Award,
  Download,
  Share2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  CloudCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Initiative } from '../types/initiative';
import { issueCertificate } from '../lib/firestoreService';
import { useAuth } from '../lib/auth';

interface VolunteerCertificateModalProps {
  initiative: Initiative | null;
  volunteerName: string;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const VolunteerCertificateModal: React.FC<VolunteerCertificateModalProps> = ({
  initiative,
  volunteerName,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [isSavingCert, setIsSavingCert] = useState(false);
  const [isSavedToCloud, setIsSavedToCloud] = useState(false);

  if (!isOpen || !initiative) return null;

  const dateIssued = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const certVerificationCode = `SDG-CERT-${initiative.id.replace('ini-', '').slice(-4).toUpperCase()}-${
    user ? user.uid.slice(-4).toUpperCase() : 'VERIFIED'
  }`;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      onShowToast('Please sign in to save your verified certificate to cloud storage.');
      return;
    }

    setIsSavingCert(true);
    try {
      await issueCertificate({
        initiativeId: initiative.id,
        initiativeTitle: initiative.title,
        userId: user.uid,
        volunteerName,
        dateIssued,
        organizerName: initiative.organizerName,
        verificationCode: certVerificationCode,
      });
      setIsSavedToCloud(true);
      onShowToast('Certificate officially registered in Sandigan Firestore registry!');
    } catch (err: any) {
      onShowToast('Could not register certificate: ' + err?.message);
    } finally {
      setIsSavingCert(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `I proudly completed volunteer service for "${initiative.title}" on Sandigan Grassroots Platform! Verification Code: ${certVerificationCode}`
      );
      onShowToast('Certificate achievement & verification code copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Certificate of Volunteerism
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Printable Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-amber-50/20">
          <div className="w-full max-w-xl border-8 border-double border-amber-600/30 p-6 sm:p-8 rounded-2xl bg-white shadow-xl text-center space-y-5 relative">
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-amber-500/40"></div>
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-amber-500/40"></div>
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-amber-500/40"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-amber-500/40"></div>

            {/* Emblem */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                S
              </div>
              <div className="text-left">
                <span className="font-black text-slate-900 text-sm tracking-tight block leading-none">
                  SANDIGAN
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
                  Grassroots Civic Network
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800 tracking-wide uppercase pt-1">
              Certificate of Volunteerism
            </h2>

            <p className="text-xs text-slate-500 italic">This is proudly awarded to</p>

            <div className="text-lg sm:text-2xl font-black text-emerald-800 border-b-2 border-emerald-600/30 pb-2 px-6 inline-block max-w-full truncate font-serif">
              {volunteerName}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              in grateful recognition of dedicated service, leadership, and bayanihan spirit contributing to{' '}
              <strong className="text-slate-900">"{initiative.title}"</strong> organized in {initiative.location}.
            </p>

            {/* Footer Credentials & Verification QR */}
            <div className="pt-4 border-t border-slate-200/80 flex items-end justify-between text-left text-xs gap-4">
              <div>
                <p className="font-semibold text-slate-800">{initiative.organizerName}</p>
                <p className="text-[10px] text-slate-400">Lead Civic Coordinator</p>
                <p className="text-[10px] text-slate-500 mt-1">Issued: {dateIssued}</p>
              </div>

              {/* Scannable Verification QR */}
              <div className="flex flex-col items-center shrink-0">
                <QRCodeSVG
                  value={`https://sandigan.org/verify/${certVerificationCode}`}
                  size={52}
                  level="L"
                  includeMargin={false}
                  fgColor="#1e293b"
                />
                <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase">
                  {certVerificationCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleShare}
              className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Code</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isSavedToCloud ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved to Firestore</span>
              </span>
            ) : (
              <button
                onClick={handleSaveToCloud}
                disabled={isSavingCert}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isSavingCert ? 'Saving...' : 'Register in Firestore'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
