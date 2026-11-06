import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Calendar, MapPin, Users, PackageCheck } from 'lucide-react';
import { Initiative, InitiativeCategory } from '../types/initiative';

interface CreateInitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (initiative: Omit<Initiative, 'id' | 'createdAt' | 'comments' | 'joined' | 'joinedUserIds'>) => void;
  prefillData?: Partial<Initiative> | null;
  onShowToast: (message: string) => void;
}

export const CreateInitiativeModal: React.FC<CreateInitiativeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillData,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InitiativeCategory>('Environment');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState<'Cagayan de Oro' | 'Misamis Oriental' | 'Bukidnon' | 'Other Region X'>('Cagayan de Oro');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(20);
  const [meetPoint, setMeetPoint] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [impactGoal, setImpactGoal] = useState('');
  const [lat, setLat] = useState<number>(8.4851);
  const [lng, setLng] = useState<number>(124.6465);
  
  // What to bring list
  const [whatToBringList, setWhatToBringList] = useState<string[]>([
    'Reusable water tumbler',
    'Work gloves',
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // AI enhancement
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Sync prefillData when provided
  useEffect(() => {
    if (prefillData) {
      if (prefillData.title) setTitle(prefillData.title);
      if (prefillData.category) setCategory(prefillData.category);
      if (prefillData.date) setDate(prefillData.date);
      if (prefillData.location) setLocation(prefillData.location);
      if (prefillData.region) setRegion(prefillData.region);
      if (prefillData.description) setDescription(prefillData.description);
      if (prefillData.capacity) setCapacity(prefillData.capacity);
      if (prefillData.meetPoint) setMeetPoint(prefillData.meetPoint);
      if (prefillData.organizerName) setOrganizerName(prefillData.organizerName);
      if (prefillData.organizerContact) setOrganizerContact(prefillData.organizerContact);
      if (prefillData.impactGoal) setImpactGoal(prefillData.impactGoal);
      if (prefillData.whatToBring && prefillData.whatToBring.length > 0) {
        setWhatToBringList(prefillData.whatToBring);
      }
    }
  }, [prefillData]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setWhatToBringList([...whatToBringList, newChecklistItem.trim()]);
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    setWhatToBringList(whatToBringList.filter((_, i) => i !== index));
  };

  const handleAiPolish = async () => {
    if (!title && !description) {
      onShowToast('Enter a draft title or description first for Gemini to polish.');
      return;
    }
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/gemini/parse-initiative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${title} - ${description} Location: ${location}` }),
      });
      const data = await response.json();
      if (data && data.initiative) {
        const item = data.initiative;
        if (item.title) setTitle(item.title);
        if (item.category) setCategory(item.category as InitiativeCategory);
        if (item.description) setDescription(item.description);
        if (item.whatToBring && item.whatToBring.length > 0) setWhatToBringList(item.whatToBring);
        if (item.impactGoal) setImpactGoal(item.impactGoal);
        if (item.meetPoint) setMeetPoint(item.meetPoint);
        onShowToast('Initiative polished with Gemini AI!');
      }
    } catch (e) {
      onShowToast('Could not reach Gemini service, keeping existing text.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !location.trim() || !description.trim()) {
      onShowToast('Please complete all required fields.');
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      date: date.trim(),
      location: location.trim(),
      region,
      description: description.trim(),
      capacity: Number(capacity) || 15,
      whatToBring: whatToBringList.length > 0 ? whatToBringList : ['Reusable water tumbler'],
      meetPoint: meetPoint.trim() || 'Main entrance landmark',
      organizerName: organizerName.trim() || 'Grassroots Volunteer Team',
      organizerContact: organizerContact.trim() || 'volunteer@sandigan.ph',
      impactGoal: impactGoal.trim() || 'Empower the community through collective civic action.',
      perks: ['Volunteer Certificate', 'Hydration station provided'],
      lat,
      lng,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              S
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Post Grassroots Initiative
              </h3>
              <p className="text-xs text-slate-500">
                Mobilize volunteers in Cagayan de Oro & Bukidnon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* AI Helper Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
            <div className="flex items-center gap-2 text-emerald-900 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Have rough thoughts? Gemini can polish wording & checklist.</span>
            </div>
            <button
              type="button"
              onClick={handleAiPolish}
              disabled={isEnhancing}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs shrink-0 transition"
            >
              {isEnhancing ? 'Polishing...' : 'Polish with AI'}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Initiative Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Macajalar Bay Coastal Cleanup"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InitiativeCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Environment">Environment</option>
                <option value="Education">Education</option>
                <option value="Disaster Response">Disaster Response</option>
                <option value="Community Relief">Community Relief</option>
                <option value="Health">Health</option>
                <option value="Animal Welfare">Animal Welfare</option>
                <option value="Livelihood">Livelihood</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Cagayan de Oro">Cagayan de Oro City</option>
                <option value="Misamis Oriental">Misamis Oriental</option>
                <option value="Bukidnon">Bukidnon</option>
                <option value="Other Region X">Other Region X</option>
              </select>
            </div>
          </div>

          {/* Date & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., Saturday, 6:30 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Volunteer Capacity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={2}
                max={500}
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 15)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Location & Rendezvous Point */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Venue Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Opol Beach Coastal Park"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rendezvous Landmark
              </label>
              <input
                type="text"
                value={meetPoint}
                onChange={(e) => setMeetPoint(e.target.value)}
                placeholder="e.g., Municipal boardwalk arch"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Google Maps Pin Selector */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Maps Location Pin</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select a quick Northern Mindanao rendezvous pin or adjust coordinates for the live map:
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { name: 'CDO Plaza Divisoria', lat: 8.4851, lng: 124.6465 },
                { name: 'Opol Beach Strip', lat: 8.5204, lng: 124.5714 },
                { name: 'Gaston Park CDO', lat: 8.4862, lng: 124.6463 },
                { name: 'Carmen Gymnasium', lat: 8.4851, lng: 124.6362 },
                { name: 'Malaybalay Bukidnon', lat: 8.1574, lng: 125.1277 },
                { name: 'Claveria Foothills', lat: 8.6142, lng: 124.8911 },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setLat(preset.lat);
                    setLng(preset.lng);
                    if (!location) setLocation(preset.name);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition border ${
                    Math.abs(lat - preset.lat) < 0.001 && Math.abs(lng - preset.lng) < 0.001
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Drive Description & Purpose <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mission, who it benefits, and volunteer tasks..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* What to bring checklist manager */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              What Volunteers Should Bring (Packing items)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="e.g., Heavy gardening gloves, Extra t-shirt"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {whatToBringList.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs border border-slate-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-slate-400 hover:text-rose-500 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Impact Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Impact Goal (Optional)
            </label>
            <input
              type="text"
              value={impactGoal}
              onChange={(e) => setImpactGoal(e.target.value)}
              placeholder="e.g., Clean 1km of coast and divert 30 sacks of plastic"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Organizer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Organizer / Group Name
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g., Kagay-an Youth Council"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Email or Channel
              </label>
              <input
                type="text"
                value={organizerContact}
                onChange={(e) => setOrganizerContact(e.target.value)}
                placeholder="e.g., youth@cdo-grassroots.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              Publish Initiative
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
