import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Initiative } from '../types/initiative';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  BookmarkCheck,
  Globe2,
  Navigation,
  Layers,
  MessageCircle,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { resolveCoordinates } from '../lib/firestoreService';

interface ExploreMapProps {
  initiatives: Initiative[];
  selectedInitiative: Initiative | null;
  onSelectInitiative: (initiative: Initiative) => void;
  onPinClick?: (initiative: Initiative) => void;
  userJoinedIds?: string[];
  onOpenChat?: (initiative: Initiative) => void;
}

// Inner camera controller hook
const MapCameraController: React.FC<{
  targetCoords: { lat: number; lng: number } | null;
  targetZoom?: number;
}> = ({ targetCoords, targetZoom = 13 }) => {
  const map = useMap();

  useEffect(() => {
    if (map && targetCoords) {
      map.panTo(targetCoords);
      if (targetZoom) {
        map.setZoom(targetZoom);
      }
    }
  }, [map, targetCoords, targetZoom]);

  return null;
};

// Category Pin styling palette
const getCategoryPinColor = (category: string) => {
  switch (category) {
    case 'Environment':
      return { bg: '#059669', border: '#047857' };
    case 'Education':
      return { bg: '#0284c7', border: '#0369a1' };
    case 'Disaster Response':
      return { bg: '#dc2626', border: '#b91c1c' };
    case 'Community Relief':
      return { bg: '#d97706', border: '#b45309' };
    case 'Health':
      return { bg: '#7c3aed', border: '#6d28d9' };
    case 'Animal Welfare':
      return { bg: '#ea580c', border: '#c2410c' };
    default:
      return { bg: '#10b981', border: '#059669' };
  }
};

export const ExploreMap: React.FC<ExploreMapProps> = ({
  initiatives,
  selectedInitiative,
  onSelectInitiative,
  userJoinedIds = [],
  onOpenChat,
}) => {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'joined'>('all');
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [cameraZoom, setCameraZoom] = useState<number>(11);

  // Retrieve API key with fallbacks
  const apiKey =
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (window as any).__GOOGLE_MAPS_API_KEY__ ||
    firebaseConfig.apiKey;

  // Center around Cagayan de Oro & Misamis Oriental
  const defaultCenter = { lat: 8.4851, lng: 124.6465 };

  // Filter initiatives: All vs My Joined Drives
  const displayedInitiatives = initiatives.filter((item) => {
    if (mapFilter === 'joined') {
      return (
        userJoinedIds.includes(item.id) ||
        (item.joinedUserIds && item.joinedUserIds.length > 0)
      );
    }
    return true;
  });

  // Active initiative currently inspected
  const activeInitiative = displayedInitiatives.find((i) => i.id === activeMarkerId);

  // Sync selected initiative from outside (e.g. from parent or clicks)
  useEffect(() => {
    if (selectedInitiative) {
      setActiveMarkerId(selectedInitiative.id);
      const coords =
        selectedInitiative.lat && selectedInitiative.lng
          ? { lat: selectedInitiative.lat, lng: selectedInitiative.lng }
          : resolveCoordinates(selectedInitiative.location, selectedInitiative.region);
      setCameraTarget(coords);
      setCameraZoom(13);
    }
  }, [selectedInitiative]);

  return (
    <div className="w-full flex flex-col rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white">
      {/* Top Map Control Bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Toggle (All Community Drives vs My Registered Drives) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMapFilter('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mapFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Community Drives ({initiatives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMapFilter('joined')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mapFilter === 'joined'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>My Registered Drives ({userJoinedIds.length})</span>
          </button>
        </div>

        {/* Right: Quick Region Zoom Jumpers */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline text-[11px]">
            Jump to Region:
          </span>
          <button
            type="button"
            onClick={() => {
              setCameraTarget({ lat: 8.4851, lng: 124.6465 });
              setCameraZoom(12);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition shadow-2xs"
          >
            CDO City
          </button>
          <button
            type="button"
            onClick={() => {
              setCameraTarget({ lat: 8.5204, lng: 124.5714 });
              setCameraZoom(12);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition shadow-2xs"
          >
            MisOr Coast
          </button>
          <button
            type="button"
            onClick={() => {
              setCameraTarget({ lat: 8.1574, lng: 125.1277 });
              setCameraZoom(11);
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition shadow-2xs"
          >
            Bukidnon
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="w-full h-[440px] sm:h-[500px] relative bg-slate-100">
        <APIProvider
          apiKey={apiKey}
          solutionChannel="gmp_mcp_codeassist_v1_aistudio"
          libraries={['marker']}
        >
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={11}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            <MapCameraController targetCoords={cameraTarget} targetZoom={cameraZoom} />

            {displayedInitiatives.map((item) => {
              const coords =
                typeof item.lat === 'number' && typeof item.lng === 'number'
                  ? { lat: item.lat, lng: item.lng }
                  : resolveCoordinates(item.location, item.region);

              const isSelected = activeMarkerId === item.id || selectedInitiative?.id === item.id;
              const isJoined = userJoinedIds.includes(item.id);
              const pinStyle = getCategoryPinColor(item.category);

              return (
                <AdvancedMarker
                  key={item.id}
                  position={coords}
                  onClick={() => {
                    setActiveMarkerId(item.id);
                    setCameraTarget(coords);
                    setCameraZoom(13);
                  }}
                  title={item.title}
                >
                  <Pin
                    background={isSelected ? '#0f172a' : pinStyle.bg}
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.3 : isJoined ? 1.2 : 1.05}
                  />
                </AdvancedMarker>
              );
            })}

            {activeInitiative && (
              <InfoWindow
                position={
                  typeof activeInitiative.lat === 'number' && typeof activeInitiative.lng === 'number'
                    ? { lat: activeInitiative.lat, lng: activeInitiative.lng }
                    : resolveCoordinates(activeInitiative.location, activeInitiative.region)
                }
                onCloseClick={() => setActiveMarkerId(null)}
                headerContent={
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100">
                      {activeInitiative.category}
                    </span>
                    {userJoinedIds.includes(activeInitiative.id) && (
                      <span className="text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded-full">
                        You're Volunteering ✓
                      </span>
                    )}
                  </div>
                }
              >
                <div className="p-1 max-w-[260px] space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {activeInitiative.title}
                  </h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{activeInitiative.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{activeInitiative.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {activeInitiative.joined} / {activeInitiative.capacity} Volunteers
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectInitiative(activeInitiative)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>Drive Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {onOpenChat && (
                      <button
                        type="button"
                        onClick={() => onOpenChat(activeInitiative)}
                        className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
                        title="Chat with Squad"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Map Status Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-2 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800">
            {mapFilter === 'all'
              ? `Showing ${displayedInitiatives.length} Community Drives in Region X`
              : `Showing ${displayedInitiatives.length} of your Registered Drives`}
          </span>
        </div>
      </div>

      {/* Map Legend Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-3 flex-wrap text-[11px] font-medium">
          <span className="text-slate-400 font-semibold">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Environment</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
            <span>Education</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Disaster Response</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span>Relief</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
            <span>Animal Welfare</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Click any pin to inspect rendezvous point and directions
        </div>
      </div>
    </div>
  );
};
