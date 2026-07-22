import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface GroupMemberLoc {
  member_id: string;
  member_name: string;
  latitude: number;
  longitude: number;
  battery_level: number;
  distance_from_center: number;
  is_missing: boolean;
  is_outside_geofence: boolean;
  is_sos_active?: boolean;
}

interface TrackingContextType {
  members: GroupMemberLoc[];
  center: { latitude: number; longitude: number };
  radiusKm: number;
  setRadiusKm: (r: number) => void;
  missingMembers: GroupMemberLoc[];
  isSosActive: boolean;
  triggerSos: (memberName: string) => void;
  clearSos: () => void;
  simulateMemberMove: (memberId: string, latOffset: number, lngOffset: number) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [radiusKm, setRadiusKm] = useState<number>(5.0);
  const [isSosActive, setIsSosActive] = useState<boolean>(false);

  // Initial group coordinates (centered around Ooty Botanical Gardens / Lake)
  const [members, setMembers] = useState<GroupMemberLoc[]>([
    { member_id: 'm1', member_name: 'Alex Rivera (Leader)', latitude: 11.4102, longitude: 76.6950, battery_level: 94, distance_from_center: 0, is_missing: false, is_outside_geofence: false },
    { member_id: 'm2', member_name: 'Robert (72y - Heart)', latitude: 11.4108, longitude: 76.6954, battery_level: 82, distance_from_center: 80, is_missing: false, is_outside_geofence: false },
    { member_id: 'm3', member_name: 'Sophia (Asthma)', latitude: 11.4096, longitude: 76.6945, battery_level: 78, distance_from_center: 110, is_missing: false, is_outside_geofence: false },
    { member_id: 'm4', member_name: 'Liam (Senior)', latitude: 11.4148, longitude: 76.6988, battery_level: 65, distance_from_center: 480, is_missing: true, is_outside_geofence: false }
  ]);

  const [center, setCenter] = useState({ latitude: 11.4102, longitude: 76.6950 });

  // Recalculate distances & centroid whenever members change
  useEffect(() => {
    if (members.length === 0) return;
    const avgLat = members.reduce((s, m) => s + m.latitude, 0) / members.length;
    const avgLng = members.reduce((s, m) => s + m.longitude, 0) / members.length;
    setCenter({ latitude: avgLat, longitude: avgLng });
  }, [members]);

  const missingMembers = members.filter(m => m.is_missing || m.distance_from_center > 300);

  const triggerSos = (memberName: string) => {
    setIsSosActive(true);
    setMembers(prev => prev.map(m => m.member_name.includes(memberName) ? { ...m, is_sos_active: true } : m));
    toast.error(`🚨 EMERGENCY SOS ACTIVATED BY ${memberName.toUpperCase()}!`, { duration: 8000, position: 'top-center' });
  };

  const clearSos = () => {
    setIsSosActive(false);
    setMembers(prev => prev.map(m => ({ ...m, is_sos_active: false })));
    toast.success('SOS Alert resolved.');
  };

  const simulateMemberMove = (memberId: string, latOffset: number, lngOffset: number) => {
    setMembers(prev => prev.map(m => {
      if (m.member_id === memberId) {
        const newLat = m.latitude + latOffset;
        const newLng = m.longitude + lngOffset;
        // Check distance from centroid (~ 0.001 deg approx 111m)
        const approxDistMeters = Math.hypot(latOffset, lngOffset) * 111000;
        const isMissing = m.distance_from_center + approxDistMeters > 300;
        
        if (isMissing && !m.is_missing) {
          toast.error(`⚠️ ALERT: ${m.member_name} is straying > 300 meters from the group!`, { duration: 6000 });
        }

        return {
          ...m,
          latitude: newLat,
          longitude: newLng,
          distance_from_center: Math.round(m.distance_from_center + approxDistMeters),
          is_missing: isMissing
        };
      }
      return m;
    }));
  };

  return (
    <TrackingContext.Provider value={{
      members,
      center,
      radiusKm,
      setRadiusKm,
      missingMembers,
      isSosActive,
      triggerSos,
      clearSos,
      simulateMemberMove
    }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) throw new Error('useTracking must be used within TrackingProvider');
  return context;
};
