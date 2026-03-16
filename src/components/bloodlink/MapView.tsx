import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';

// Fix default marker icons for webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (color: string, size: number = 12) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px; 
      background: ${color}; 
      border: 2px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const pulsingIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="position:relative;">
      <div style="
        position: absolute; width: 24px; height: 24px; left: -12px; top: -12px;
        background: ${color}33; border-radius: 50%; 
        animation: pulse-ring 1.5s ease-out infinite;
      "></div>
      <div style="
        width: 14px; height: 14px; left: -7px; top: -7px; position: absolute;
        background: ${color}; border: 2px solid white; border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [0, 0],
  });
};

interface MapPoint {
  lat: number;
  lng: number;
  type: 'hospital' | 'donor' | 'request' | 'live_donor';
  label: string;
  extra?: string;
}

interface MapViewProps {
  hospitals?: { id: string; name: string; address?: string; latitude: number; longitude: number }[];
  donors?: { id: string; fullName: string; bloodType: string; latitude: number; longitude: number; isAvailable: boolean }[];
  requests?: { id: string; bloodType: string; hospitalName: string; urgency: string; latitude: number; longitude: number }[];
  liveDonors?: { id: string; name: string; latitude: number; longitude: number; missionStatus?: string }[];
  className?: string;
  showLiveTracking?: boolean;
  center?: [number, number];
  zoom?: number;
}

export const MapView = ({
  hospitals = [],
  donors = [],
  requests = [],
  liveDonors = [],
  className = '',
  showLiveTracking = false,
  center,
  zoom = 13,
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [realtimeDonors, setRealtimeDonors] = useState<any[]>([]);

  // Subscribe to realtime donor locations
  useEffect(() => {
    if (!showLiveTracking) return;

    const channel = supabase
      .channel('live-locations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'donor_live_locations',
      }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setRealtimeDonors(prev => prev.filter(d => d.id !== payload.old.id));
        } else {
          setRealtimeDonors(prev => {
            const existing = prev.findIndex(d => d.donor_id === payload.new.donor_id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = payload.new;
              return updated;
            }
            return [...prev, payload.new];
          });
        }
      })
      .subscribe();

    // Initial load
    supabase.from('donor_live_locations' as any).select('*').then(({ data }) => {
      if (data) setRealtimeDonors(data as any[]);
    });

    return () => { supabase.removeChannel(channel); };
  }, [showLiveTracking]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = center || [24.3745, 88.6042];
    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    const allPoints: MapPoint[] = [];

    // Hospitals
    hospitals.forEach(h => {
      if (!h.latitude || !h.longitude) return;
      const marker = L.marker([h.latitude, h.longitude], { icon: createIcon('#3b82f6', 14) });
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 140px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">🏥 ${h.name}</div>
          ${h.address ? `<div style="font-size: 11px; color: #666;">${h.address}</div>` : ''}
        </div>
      `);
      markers.addLayer(marker);
      allPoints.push({ lat: h.latitude, lng: h.longitude, type: 'hospital', label: h.name });
    });

    // Donors
    donors.forEach(d => {
      if (!d.latitude || !d.longitude) return;
      const marker = L.marker([d.latitude, d.longitude], { icon: createIcon('#22c55e', 10) });
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 120px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">🩸 ${d.fullName}</div>
          <div style="font-size: 11px; color: #666;">Blood: ${d.bloodType}</div>
          <div style="font-size: 11px; color: ${d.isAvailable ? '#22c55e' : '#999'};">${d.isAvailable ? '✅ Available' : '⏳ Unavailable'}</div>
        </div>
      `);
      markers.addLayer(marker);
      allPoints.push({ lat: d.latitude, lng: d.longitude, type: 'donor', label: d.fullName });
    });

    // Requests
    requests.forEach(r => {
      if (!r.latitude || !r.longitude) return;
      const urgencyColor = r.urgency === 'CRITICAL' ? '#ef4444' : r.urgency === 'URGENT' ? '#f59e0b' : '#6b7280';
      const marker = L.marker([r.latitude, r.longitude], { icon: pulsingIcon(urgencyColor) });
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 140px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">🚨 ${r.bloodType} Needed</div>
          <div style="font-size: 11px; color: #666;">${r.hospitalName}</div>
          <div style="font-size: 11px; font-weight: 600; color: ${urgencyColor};">${r.urgency}</div>
        </div>
      `);
      markers.addLayer(marker);
      allPoints.push({ lat: r.latitude, lng: r.longitude, type: 'request', label: r.bloodType });
    });

    // Live donors (from props)
    liveDonors.forEach(ld => {
      if (!ld.latitude || !ld.longitude) return;
      const marker = L.marker([ld.latitude, ld.longitude], { icon: pulsingIcon('#8b5cf6') });
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 120px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">🏃 ${ld.name}</div>
          <div style="font-size: 11px; color: #8b5cf6;">${ld.missionStatus || 'On Mission'}</div>
        </div>
      `);
      markers.addLayer(marker);
      allPoints.push({ lat: ld.latitude, lng: ld.longitude, type: 'live_donor', label: ld.name });
    });

    // Realtime donors
    realtimeDonors.forEach((rd: any) => {
      if (!rd.latitude || !rd.longitude) return;
      const marker = L.marker([rd.latitude, rd.longitude], { icon: pulsingIcon('#8b5cf6') });
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 120px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">🏃 Donor on Mission</div>
          <div style="font-size: 11px; color: #8b5cf6;">${rd.status || 'active'}</div>
        </div>
      `);
      markers.addLayer(marker);
      allPoints.push({ lat: rd.latitude, lng: rd.longitude, type: 'live_donor', label: 'Live Donor' });
    });

    // Fit bounds if we have points
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [hospitals, donors, requests, liveDonors, realtimeDonors, center, zoom]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl p-2.5 shadow-lg z-[1000] border border-border">
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] border border-white shadow-sm" />
            হাসপাতাল
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-white shadow-sm" />
            ডোনার
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] border border-white shadow-sm" />
            অনুরোধ
          </span>
          {(showLiveTracking || liveDonors.length > 0) && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] border border-white shadow-sm animate-pulse" />
              লাইভ ট্র্যাকিং
            </span>
          )}
        </div>
      </div>

      {/* Pulse animation CSS */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
};
