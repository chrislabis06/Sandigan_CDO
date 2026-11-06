import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  CalendarPlus,
  ExternalLink,
  CheckCircle2,
  PackageCheck,
  Check,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Initiative } from '../types/initiative';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface InitiativeCardProps {
  initiative: Initiative;
  isUserJoined: boolean;
  onToggleJoin: (id: string) => void;
  onOpenDetails: (initiative: Initiative) => void;
  onOpenChat?: (initiative: Initiative) => void;
  onViewOnMap?: (initiative: Initiative) => void;
  onShowToast: (message: string) => void;
}

export const InitiativeCard: React.FC<InitiativeCardProps> = ({
  initiative,
  isUserJoined,
  onToggleJoin,
  onOpenDetails,
  onOpenChat,
  onViewOnMap,
  onShowToast,
}) => {
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const spotsLeft = Math.max(0, initiative.capacity - initiative.joined);
  const isFull = initiative.joined >= initiative.capacity && !isUserJoined;
  const percentFilled = Math.min(100, Math.round((initiative.joined / initiative.capacity) * 100));

  // Category color mapper
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Environment':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Education':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Disaster Response':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Community Relief':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Health':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Animal Welfare':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFull) return;

    if (!isUserJoined) {
      // Trigger burst confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
        });
      } catch (e) {
        // Safe if canvas unavailable
      }
      onShowToast(`Mabuhay! You've joined "${initiative.title}". See details for rendezvous point!`);
    } else {
      onShowToast(`You've unregistered from "${initiative.title}".`);
    }

    onToggleJoin(initiative.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Join me in this grassroots drive: "${initiative.title}" in ${initiative.location} on ${initiative.date}! Coordinated on Sandigan.`
      );
      setCopied(true);
      onShowToast('Share text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(initiative)}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative"
    >
      <div className="space-y-3.5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryStyles(
                initiative.category
              )}`}
            >
              {initiative.category}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {initiative.region}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{initiative.date}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition">
          {initiative.title}
        </h3>

        {/* Location with Quick View on Map trigger */}
        <div
          onClick={(e) => {
            if (onViewOnMap) {
              e.stopPropagation();
              onViewOnMap(initiative);
            }
          }}
          className="text-xs sm:text-sm text-slate-500 flex items-center justify-between gap-1.5 leading-snug group/loc hover:text-emerald-700 transition"
          title="Click to pinpoint on the Interactive Map"
        >
          <div className="flex items-start gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 group-hover/loc:scale-110 transition-transform" />
            <span className="line-clamp-1">{initiative.location}</span>
          </div>
          {onViewOnMap && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 opacity-80 group-hover/loc:opacity-100 transition">
              Map Pin ↗
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {initiative.description}
        </p>

        {/* What to bring preview chips */}
        {initiative.whatToBring && initiative.whatToBring.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <span className="truncate">{initiative.whatToBring[0]}</span>
              {initiative.whatToBring.length > 1 && (
                <span className="text-slate-400">+{initiative.whatToBring.length - 1} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom section with progress & actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 space-y-3.5">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Slots:{' '}
              <strong className="text-slate-900 font-bold">
                {initiative.joined}
              </strong>{' '}
              / {initiative.capacity} filled
            </span>
            <span
              className={`font-semibold text-[11px] ${
                isFull
                  ? 'text-slate-400'
                  : spotsLeft <= 5
                  ? 'text-rose-600 font-bold'
                  : 'text-emerald-700'
              }`}
            >
              {isFull ? 'Drive Full' : `${spotsLeft} spots left`}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-slate-400'
                  : percentFilled > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleJoinClick}
            disabled={isFull && !isUserJoined}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all tracking-tight shadow-sm flex items-center justify-center gap-1.5 active:scale-98 ${
              isUserJoined
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : isFull
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isUserJoined ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>You're Volunteering ✓</span>
              </>
            ) : isFull ? (
              <span>Event Full</span>
            ) : (
              <span>Tap to Join & Volunteer</span>
            )}
          </button>

          {/* Real-time Drive Chat Button */}
          {onOpenChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(initiative);
              }}
              className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-slate-200/60"
              title="Open Live Chat Channel"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200/60"
            title="Share Initiative"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Calendar Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCalendarMenu(!showCalendarMenu);
              }}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200/60"
              title="Add to Calendar"
            >
              <CalendarPlus className="w-4 h-4" />
            </button>

            {showCalendarMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 space-y-1 text-xs"
              >
                <a
                  href={getGoogleCalendarUrl(initiative)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowCalendarMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Calendar</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsFile(initiative);
                    setShowCalendarMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-left"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Download .ICS file</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
