import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  CalendarPlus,
  Send,
  MessageSquare,
  Sparkles,
  PackageCheck,
  ShieldCheck,
  ExternalLink,
  Share2,
  Check,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Initiative } from '../types/initiative';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import { useAuth } from '../lib/auth';

interface InitiativeDetailModalProps {
  initiative: Initiative | null;
  onClose: () => void;
  isUserJoined: boolean;
  onToggleJoin: (id: string) => void;
  onAddComment: (initiativeId: string, author: string, text: string) => void;
  onOpenVolunteerPass: (initiative: Initiative) => void;
  onOpenOrganizerDesk: (initiative: Initiative) => void;
  onOpenChat: (initiative: Initiative) => void;
  onViewOnMap?: (initiative: Initiative) => void;
  onShowToast: (message: string) => void;
}

export const InitiativeDetailModal: React.FC<InitiativeDetailModalProps> = ({
  initiative,
  onClose,
  isUserJoined,
  onToggleJoin,
  onAddComment,
  onOpenVolunteerPass,
  onOpenOrganizerDesk,
  onOpenChat,
  onViewOnMap,
  onShowToast,
}) => {
  const { user, isOrganizer, isAdmin } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!initiative) return null;

  const spotsLeft = Math.max(0, initiative.capacity - initiative.joined);
  const isFull = initiative.joined >= initiative.capacity && !isUserJoined;

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleJoin = () => {
    if (isFull) return;

    if (!isUserJoined) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399'],
        });
      } catch (e) {}
      onShowToast(`Mabuhay! You're officially volunteering for "${initiative.title}".`);
    } else {
      onShowToast(`You've unregistered from "${initiative.title}".`);
    }
    onToggleJoin(initiative.id);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = commentAuthor.trim() || 'Community Volunteer';
    onAddComment(initiative.id, author, commentText.trim());
    setCommentText('');
    onShowToast('Question/Update posted to initiative discussion!');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Join me in this grassroots drive: "${initiative.title}" in ${initiative.location} on ${initiative.date}! Coordinated on Sandigan.`
      );
      setCopied(true);
      onShowToast('Event link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {initiative.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {initiative.region}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Title & Organization */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {initiative.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
              <span>
                Organized by: <strong className="text-slate-900">{initiative.organizerName}</strong>
              </span>
              {initiative.organizerContact && (
                <span>• {initiative.organizerContact}</span>
              )}
            </div>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Date & Assembly Time</div>
                <div className="text-slate-600">{initiative.date}</div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Venue & Location</div>
                  <div className="text-slate-600">{initiative.location}</div>
                </div>
              </div>
              {onViewOnMap && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewOnMap(initiative);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition shrink-0"
                >
                  View on Map ↗
                </button>
              )}
            </div>

            {initiative.meetPoint && (
              <div className="flex items-start gap-2.5 sm:col-span-2 pt-2 border-t border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Meeting Landmark / Rendezvous</div>
                  <div className="text-slate-600">{initiative.meetPoint}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Initiative Mission
            </h4>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700">
              {initiative.description}
            </p>
          </div>

          {/* Targeted Impact Goal */}
          {initiative.impactGoal && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-emerald-950">Community Impact Target</div>
                <div className="mt-0.5 text-emerald-800 leading-relaxed font-medium">
                  {initiative.impactGoal}
                </div>
              </div>
            </div>
          )}

          {/* Interactive What To Bring Checklist */}
          {initiative.whatToBring && initiative.whatToBring.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Volunteer Packing Checklist (Click to prepare)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {Object.values(checkedItems).filter(Boolean).length} / {initiative.whatToBring.length} packed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {initiative.whatToBring.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheck(item)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm text-left transition ${
                      checkedItems[item]
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium line-through'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        checkedItems[item]
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {checkedItems[item] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amenities & Perks */}
          {initiative.perks && initiative.perks.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Provided on Site
              </h4>
              <div className="flex flex-wrap gap-2">
                {initiative.perks.map((perk, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80"
                  >
                    ★ {perk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Volunteer Roster */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Signed-up Volunteers ({initiative.joined} / {initiative.capacity})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChat(initiative)}
                  className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Drive Chat</span>
                </button>
                {(isOrganizer || isAdmin || (user && initiative.userId === user.uid)) && (
                  <button
                    type="button"
                    onClick={() => onOpenOrganizerDesk(initiative)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
                  >
                    Organizer Desk
                  </button>
                )}
              </div>
            </div>

            {/* Avatar cluster */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2">
              {Array.from({ length: Math.min(initiative.joined, 12) }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm shrink-0"
                >
                  {String.fromCharCode(65 + (i % 26))}
                </div>
              ))}
              {initiative.joined > 12 && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                  +{initiative.joined - 12}
                </div>
              )}
            </div>

            {/* If user is joined, show prominent Volunteer Pass Banner */}
            {isUserJoined && (
              <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between gap-3 shadow-md shadow-emerald-600/15">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your Volunteer Spot is Confirmed</span>
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    Access your official on-site check-in badge & pass.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenVolunteerPass(initiative)}
                  className="px-3.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-xs shrink-0 transition"
                >
                  View Pass & QR
                </button>
              </div>
            )}
          </div>

          {/* Community Q&A & Discussion */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Volunteer Q&A & Carpool Board ({initiative.comments?.length || 0})
              </h4>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {initiative.comments && initiative.comments.length > 0 ? (
                initiative.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-4 h-4 rounded-full ${
                            comment.avatarColor || 'bg-slate-400'
                          } inline-block`}
                        />
                        <span>{comment.author}</span>
                      </div>
                      <span className="text-slate-400 font-normal text-[11px]">{comment.time}</span>
                    </div>
                    <p className="text-slate-600 pl-5 leading-relaxed">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No questions asked yet. Have a question about carpooling or what to bring? Ask below!
                </div>
              )}
            </div>

            {/* Post question form */}
            <form onSubmit={handlePostComment} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Ask a question or share carpool info..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  <Send className="w-3 h-3" />
                  <span>Post to Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChat(initiative)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 text-xs font-bold text-emerald-900 transition shadow-xs"
              title="Open Live Chat Channel"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Chat</span>
            </button>

            <a
              href={getGoogleCalendarUrl(initiative)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              title="Add to Google Calendar"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Calendar</span>
            </a>

            <button
              onClick={() => downloadIcsFile(initiative)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              title="Download .ICS for Apple/Outlook"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
              <span>.ICS File</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
              title="Share event link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleJoin}
            disabled={isFull && !isUserJoined}
            className={`py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 flex items-center gap-2 ${
              isUserJoined
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : isFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isUserJoined ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>You're Registered (Leave Drive)</span>
              </>
            ) : isFull ? (
              <span>Drive is Full</span>
            ) : (
              <span>Confirm & Volunteer Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
