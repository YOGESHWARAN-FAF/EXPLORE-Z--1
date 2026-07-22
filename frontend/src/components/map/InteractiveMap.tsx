import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTracking } from '../../context/TrackingContext';

export const InteractiveMap: React.FC<{ height?: string }> = ({ height = '550px' }) => {
  const { members, center, radiusKm, isSosActive } = useTracking();
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map once on mount, destroy on unmount
  useEffect(() => {
    if (!divRef.current) return;

    const map = L.map(divRef.current, {
      center: [center.latitude, center.longitude],
      zoom: 14,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle on center/radius change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([center.latitude, center.longitude], map.getZoom(), { animate: true, duration: 1 });
    circleRef.current?.remove();
    circleRef.current = L.circle([center.latitude, center.longitude], {
      radius: radiusKm * 1000,
      color: isSosActive ? '#ef4444' : '#ea580c',
      fillColor: isSosActive ? '#f87171' : '#fb923c',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 8',
    }).addTo(map);
  }, [center.latitude, center.longitude, radiusKm, isSosActive]);

  // Update member markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    members.forEach(m => {
      let pinColor = '#ea580c';
      if (m.is_sos_active) pinColor = '#ef4444';
      else if (m.is_missing) pinColor = '#f59e0b';

      const icon = L.divIcon({
        className: '',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 36 48">
          <g><path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.059 27.941 0 18 0z" fill="${pinColor}"/>
          <circle cx="18" cy="18" r="10" fill="#fff"/>
          <text x="18" y="22" font-size="11" font-weight="bold" fill="${pinColor}" text-anchor="middle">${m.member_name.charAt(0)}</text></g></svg>`,
        iconSize: [34, 46], iconAnchor: [17, 46], popupAnchor: [0, -40],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon })
        .bindPopup(`<div style="font-family:system-ui;padding:8px;min-width:160px">
          <div style="font-weight:800;color:#ea580c;font-size:13px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #e2e8f0">${m.member_name}</div>
          <div style="font-size:11px;color:#475569">Battery: <strong>${m.battery_level}%</strong></div>
          <div style="font-size:11px;color:#475569">Distance: <strong>${m.distance_from_center}m</strong></div>
        </div>`)
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [members]);

  return (
    <div ref={divRef} style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" />
  );
};
