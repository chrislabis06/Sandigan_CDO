import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Sparkles, Users, Sprout, Play, Copy, Check, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnimationShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnimationShowcaseModal: React.FC<AnimationShowcaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'compassion' | 'happiness' | 'service' | 'volunteerism'>('compassion');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // States for interactive demos
  const [compassionPulse, setCompassionPulse] = useState(false);
  const [bayanihanJoined, setBayanihanJoined] = useState(false);
  const [sproutGrown, setSproutGrown] = useState(false);

  if (!isOpen) return null;

  const triggerJoyConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ec4899', '#6366f1', '#06b6d4'],
    });
  };

  const copyCode = (code: string, idx: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const codeSnippets = {
    compassion: `// 1. Compassion: Harmonic Empathy Pulse
// Soft organic breathing rhythm communicates emotional safety and deep warmth.
import { motion } from 'motion/react';

export const CompassionHearth = () => (
  <div className="relative flex items-center justify-center">
    {/* Ambient Empathy Aura */}
    <motion.div
      animate={{
        scale: [1, 1.25, 1],
        opacity: [0.35, 0.7, 0.35],
      }}
      transition={{
        duration: 3.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute w-32 h-32 rounded-full bg-rose-400/30 blur-xl"
    />

    {/* Gentle Resonant Core */}
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 cursor-pointer"
    >
      <Heart className="w-9 h-9 fill-current" />
    </motion.div>
  </div>
);`,

    happiness: `// 2. Happiness: Radiant Spring Bloom & Celebration
// Buoyant, weightless particle burst conveys joyful gratitude when pledging support.
import { motion } from 'motion/react';

export const JoyBurst = ({ onTrigger }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92, rotate: [0, -3, 3, 0] }}
      onClick={onTrigger}
      className="px-6 py-3 bg-gradient-to-r from-amber-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
    >
      <motion.span
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        ✨
      </motion.span>
      <span>Celebrate Joyful Act</span>
    </motion.button>
  );
};`,

    service: `// 3. Service: The Bayanihan Magnetic Assembly
// Dispersed community dots drawn inward magnetically into an interconnected protective circle.
import { motion } from 'motion/react';

export const BayanihanAssembly = ({ isUnited }) => {
  const nodes = [
    { x: -50, y: -40, label: 'CDO' },
    { x: 50, y: -40, label: 'Bukidnon' },
    { x: 60, y: 35, label: 'MisOr' },
    { x: -60, y: 35, label: 'Iligan' },
    { x: 0, y: 65, label: 'Camiguin' },
  ];

  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
      {/* Central Civic Pillar */}
      <motion.div
        animate={{ scale: isUnited ? 1.15 : 1 }}
        className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold z-10 shadow-md"
      >
        Sandigan
      </motion.div>

      {/* Interlocking Volunteers */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          animate={{
            x: isUnited ? node.x * 0.45 : node.x,
            y: isUnited ? node.y * 0.45 : node.y,
            scale: isUnited ? 1.1 : 0.9,
          }}
          transition={{ type: "spring", stiffness: 140, damping: 15 }}
          className="absolute w-10 h-10 rounded-full bg-white border-2 border-emerald-500 text-emerald-800 text-xs font-bold flex items-center justify-center shadow-md"
        >
          {node.label}
        </motion.div>
      ))}
    </div>
  );
};`,

    volunteerism: `// 4. Volunteerism & Impact: The Sprout of Gratitude
// Organic growth micro-interaction: a seed sprouts leaves as service hours unfold.
import { motion } from 'motion/react';

export const SproutOfService = ({ isSprouted }) => (
  <div className="flex flex-col items-center">
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: isSprouted ? 1.2 : 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 shadow-md"
    >
      <motion.div
        animate={{
          rotate: isSprouted ? [0, -10, 10, 0] : 0,
          y: isSprouted ? -4 : 0,
        }}
        transition={{ duration: 0.8 }}
      >
        <Sprout className="w-10 h-10 stroke-[2.5]" />
      </motion.div>
    </motion.div>
  </div>
);`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Animation & Micro-Interaction Design Lab
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual Motion Communicating Compassion, Happiness, Service, and Volunteerism
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('compassion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'compassion'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
            <span>1. Compassion (Empathy Hearth)</span>
          </button>

          <button
            onClick={() => setActiveTab('happiness')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'happiness'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>2. Happiness (Joy Bloom)</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'service'
                ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>3. Service (Bayanihan Assembly)</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteerism')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'volunteerism'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>4. Volunteerism (Sprout of Impact)</span>
          </button>
        </div>

        {/* Tab Content & Interactive Playground */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* TAB 1: COMPASSION */}
          {activeTab === 'compassion' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-b from-rose-50/60 to-white border border-rose-200/80">
                {/* Live Demo Canvas */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-rose-100 shadow-inner relative min-h-[220px]">
                  {/* Ambient breathing halo */}
                  <motion.div
                    animate={{
                      scale: compassionPulse ? [1, 1.4, 1] : [1, 1.25, 1],
                      opacity: compassionPulse ? [0.6, 0.9, 0.6] : [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: compassionPulse ? 1.8 : 3.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute w-36 h-36 rounded-full bg-rose-400/25 blur-2xl pointer-events-none"
                  />

                  {/* Core Heart */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => setCompassionPulse(!compassionPulse)}
                    className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-300 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-500/25 cursor-pointer group"
                  >
                    <Heart className="w-10 h-10 fill-white" />
                    <span className="text-[10px] font-bold mt-1 tracking-tight">Empathy</span>
                  </motion.button>

                  <div className="mt-4 text-xs font-semibold text-rose-800">
                    Click to toggle heart cadence ({compassionPulse ? 'Deep Resonant Pulse' : 'Gentle Ambient Rest'})
                  </div>
                </div>

                {/* Conceptual Explanation */}
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Visual Language: Empathy & Psychological Safety</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    Harmonic Breathing Resonance
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Compassion cannot feel abrupt or sharp. By employing a <strong>3.2 to 3.6-second harmonic easing curve (easeInOut)</strong>, the motion mirrors the resting human respiratory cycle. The soft outer blur aura expands outward, visually communicating non-judgmental presence, listening, and reassurance.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 font-medium">
                    💡 <strong>Where to apply:</strong> Cause cards when a volunteer hovers over a community crisis, caregiver support hubs, or empathy pledge buttons.
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Framer Motion / Motion Implementation</span>
                  <button
                    onClick={() => copyCode(codeSnippets.compassion, 1)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 lowercase text-xs"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'Copied' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {codeSnippets.compassion}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: HAPPINESS */}
          {activeTab === 'happiness' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200/80">
                {/* Live Demo */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-amber-100 shadow-inner min-h-[220px] gap-4">
                  <motion.button
                    whileHover={{ scale: 1.06, rotate: [0, -1, 1, 0] }}
                    whileTap={{ scale: 0.92 }}
                    onClick={triggerJoyConfetti}
                    className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-500/25 flex items-center gap-2.5 text-sm sm:text-base cursor-pointer transition active:scale-95"
                  >
                    <Sparkles className="w-5 h-5 text-amber-100" />
                    <span>Spark Collective Happiness</span>
                  </motion.button>
                  <p className="text-xs text-slate-500 text-center font-medium">
                    Click to trigger radiant confetti burst & uplifting micro-spring
                  </p>
                </div>

                {/* Explanation */}
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Visual Language: Radiance & Shared Delight</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    Radiant Spring & Particle Bloom
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Happiness in civic platforms is contagious. High-damping springs with slight rotational playfulness mimic natural joyful body language (jumping, clapping, cheering). Particle dispersal creates dopamine without feeling commercialized or intrusive.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-amber-900 font-medium">
                    💡 <strong>Where to apply:</strong> The exact moment a volunteer registers for an initiative, when a donation goal is reached, or when milestone badges unlock.
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Code Snippet</span>
                  <button
                    onClick={() => copyCode(codeSnippets.happiness, 2)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 lowercase text-xs"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 2 ? 'Copied' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {codeSnippets.happiness}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE (BAYANIHAN) */}
          {activeTab === 'service' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-b from-teal-50/60 to-white border border-teal-200/80">
                {/* Live Demo */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-teal-100 shadow-inner min-h-[260px] relative">
                  <div className="relative w-52 h-52 flex items-center justify-center">
                    {/* Center Core */}
                    <motion.div
                      animate={{ scale: bayanihanJoined ? 1.15 : 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs flex flex-col items-center justify-center z-10 shadow-lg"
                    >
                      <span>Sandigan</span>
                      <span className="text-[9px] opacity-80 font-normal">Stand as 1</span>
                    </motion.div>

                    {/* Nodes */}
                    {[
                      { x: -55, y: -45, label: 'CDO' },
                      { x: 55, y: -45, label: 'Bukidnon' },
                      { x: 65, y: 35, label: 'MisOr' },
                      { x: -65, y: 35, label: 'Iligan' },
                      { x: 0, y: 70, label: 'Youth' },
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          x: bayanihanJoined ? node.x * 0.45 : node.x,
                          y: bayanihanJoined ? node.y * 0.45 : node.y,
                          scale: bayanihanJoined ? 1.15 : 0.88,
                        }}
                        transition={{ type: 'spring', stiffness: 150, damping: 14 }}
                        className="absolute w-10 h-10 rounded-full bg-white border-2 border-emerald-500 text-emerald-800 text-[11px] font-bold flex items-center justify-center shadow-md"
                      >
                        {node.label}
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => setBayanihanJoined(!bayanihanJoined)}
                    className="mt-3 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
                  >
                    {bayanihanJoined ? 'Disperse Nodes (Individual)' : 'Assemble Inward (Stand Together)'}
                  </button>
                </div>

                {/* Explanation */}
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Visual Language: Mutual Support & Bayanihan</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    Magnetic Assembly & Cohesive Lock
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Filipino <em>Bayanihan</em> (carrying a house together) is about individual citizens converging to lift a burden none could bear alone. By drawing peripheral volunteer nodes inward towards a central core, motion visually confirms: <em>"You are not alone; we stand together."</em>
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-teal-200 text-xs text-teal-900 font-medium">
                    💡 <strong>Where to apply:</strong> Community capacity bar transitions, volunteer avatar rosters locking into place, and disaster relief task force groupings.
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Code Snippet</span>
                  <button
                    onClick={() => copyCode(codeSnippets.service, 3)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 lowercase text-xs"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? 'Copied' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {codeSnippets.service}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: VOLUNTEERISM */}
          {activeTab === 'volunteerism' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-200/80">
                {/* Live Demo */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-emerald-100 shadow-inner min-h-[220px] gap-4">
                  <motion.div
                    animate={{ scale: sproutGrown ? 1.25 : 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-24 h-24 rounded-3xl bg-emerald-100 border-2 border-emerald-400 flex flex-col items-center justify-center text-emerald-700 shadow-lg relative"
                  >
                    <motion.div
                      animate={{
                        rotate: sproutGrown ? [0, -12, 12, 0] : 0,
                        y: sproutGrown ? -4 : 0,
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <Sprout className="w-12 h-12 stroke-[2.5]" />
                    </motion.div>
                    <span className="text-[10px] font-extrabold mt-1 text-emerald-800">
                      {sproutGrown ? 'Impact Blooming' : 'Seed of Service'}
                    </span>
                  </motion.div>

                  <button
                    onClick={() => setSproutGrown(!sproutGrown)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                  >
                    {sproutGrown ? 'Reset Seed' : 'Nurture Volunteer Impact'}
                  </button>
                </div>

                {/* Explanation */}
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Visual Language: Organic Growth & Regeneration</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    The Sprout of Gratitude
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Volunteerism is regenerative: time invested blooms into greener streets, educated children, and disaster-ready barangays. Botanical unfurling motions with organic overshoot physics celebrate real-world outcomes rather than transactional metrics.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900 font-medium">
                    💡 <strong>Where to apply:</strong> When marking checklist items ready, filling slot progress bars, or reviewing monthly volunteer impact reports.
                  </div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Code Snippet</span>
                  <button
                    onClick={() => copyCode(codeSnippets.volunteerism, 4)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 lowercase text-xs"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 4 ? 'Copied' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                  {codeSnippets.volunteerism}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Built using Framer Motion (motion/react), Tailwind CSS & Canvas-Confetti</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};
