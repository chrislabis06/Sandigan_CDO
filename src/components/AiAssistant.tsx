import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, MapPin, Calendar, Users, PackageCheck, Send } from 'lucide-react';
import { Initiative, InitiativeCategory } from '../types/initiative';

interface AiAssistantProps {
  onDirectPublish: (initiative: Omit<Initiative, 'id' | 'createdAt' | 'comments' | 'joined' | 'joinedUserIds'>) => void;
  onOpenWithPrefill: (prefill: Partial<Initiative>) => void;
}

const PRESET_IDEAS = [
  "Need 15 volunteers this Saturday morning to clean up plastic waste around Opol Beach...",
  "Looking for 8 mentors to teach basic scratch programming to kids at CDO Public Library on Wednesday...",
  "Flash flood relief: need 25 volunteers at Carmen Gymnasium to repack rice and canned goods this Friday...",
  "Planting 500 indigenous tree saplings in Claveria upland watershed this Sunday 6 AM, need 30 volunteers...",
];

export const AiAssistant: React.FC<AiAssistantProps> = ({
  onDirectPublish,
  onOpenWithPrefill,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a brief volunteer thought or idea first.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini/parse-initiative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse idea with Gemini');
      }

      const data = await response.json();
      if (data && data.initiative) {
        setParsedResult(data.initiative);
      } else {
        throw new Error('Invalid format returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not connect to Gemini parser. Falling back to structured format.');
      // Intelligent client fallback
      setParsedResult({
        title: prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''),
        category: 'Environment',
        date: 'This Saturday, 7:00 AM',
        location: 'Cagayan de Oro City Center',
        region: 'Cagayan de Oro',
        description: prompt,
        capacity: 20,
        whatToBring: ['Reusable water tumbler', 'Work gloves', 'Personal sun protection'],
        meetPoint: 'Plaza Divisoria fountain landmark',
        organizerName: 'Sandigan Community Organizers',
        impactGoal: 'Mobilize community action and support local resilience.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishDirectly = () => {
    if (!parsedResult) return;

    onDirectPublish({
      title: parsedResult.title || 'Grassroots Initiative',
      category: (parsedResult.category as InitiativeCategory) || 'Environment',
      date: parsedResult.date || 'Upcoming Weekend',
      location: parsedResult.location || 'Cagayan de Oro',
      region: (parsedResult.region as any) || (parsedResult.location?.includes('Bukidnon') ? 'Bukidnon' : parsedResult.location?.includes('Misamis') ? 'Misamis Oriental' : 'Cagayan de Oro'),
      description: parsedResult.description || prompt,
      capacity: Number(parsedResult.capacity) || 20,
      whatToBring: parsedResult.whatToBring || ['Reusable water bottle', 'Work gloves'],
      meetPoint: parsedResult.meetPoint || 'Main landmark entrance',
      organizerName: parsedResult.organizerName || 'Local Grassroots Organizers',
      organizerContact: 'contact@sandigan.ph',
      impactGoal: parsedResult.impactGoal || 'Community empowerment and volunteer action.',
      perks: ['Community certificate', 'Refreshments provided'],
    });

    // Reset
    setPrompt('');
    setParsedResult(null);
  };

  const handleEditInModal = () => {
    if (!parsedResult) return;
    onOpenWithPrefill({
      title: parsedResult.title,
      category: parsedResult.category as InitiativeCategory,
      date: parsedResult.date,
      location: parsedResult.location,
      description: parsedResult.description,
      capacity: parsedResult.capacity,
      whatToBring: parsedResult.whatToBring,
      meetPoint: parsedResult.meetPoint,
      organizerName: parsedResult.organizerName,
      impactGoal: parsedResult.impactGoal,
    });
  };

  return (
    <section className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden transition-all">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full space-y-5 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm md:text-base uppercase tracking-wider font-bold text-emerald-700">
              Gemini Prompt Assistant
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">
              Type a raw thought → Auto-format event
            </span>
          </div>

          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            Powered by Gemini 3.8 Flash
          </span>
        </div>

        {/* Input Textarea */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            rows={3}
            className="w-full min-h-[140px] bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition resize-y"
            placeholder="e.g., Need 15 volunteers this Saturday morning to clean up plastic waste around Opol Beach, please bring work gloves..."
          />
        </div>

        {/* Preset suggestions */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Try an idea from the field:
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {PRESET_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(idea);
                  setParsedResult(null);
                }}
                className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200/80 transition-colors line-clamp-1 max-w-full"
              >
                "{idea.slice(0, 48)}..."
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Action button bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs sm:text-sm text-slate-500">
            AI auto-extracts venue, category, date, and required capacity.
          </span>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl text-sm sm:text-base transition-all tracking-tight flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 active:scale-98"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Structuring Initiative with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Transform with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Preview Card */}
        {parsedResult && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  AI Formatted Initiative Ready
                </span>
              </div>
              <button
                onClick={() => setParsedResult(null)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear preview</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {parsedResult.category || 'Environment'}
                </span>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {parsedResult.date}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {parsedResult.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <strong>Location:</strong> {parsedResult.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <strong>Target Volunteers:</strong> {parsedResult.capacity} slots
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {parsedResult.description}
              </p>

              {parsedResult.whatToBring && parsedResult.whatToBring.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recommended Checklist:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResult.whatToBring.map((item: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedResult.impactGoal && (
                <div className="text-xs font-medium text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/50">
                  🌱 <strong>Impact Goal:</strong> {parsedResult.impactGoal}
                </div>
              )}
            </div>

            {/* Quick Publish or Customize Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handlePublishDirectly}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Publish Directly to Active Drives</span>
              </button>
              <button
                type="button"
                onClick={handleEditInModal}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Customize in Full Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
