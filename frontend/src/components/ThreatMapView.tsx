import React, { useEffect, useState } from 'react';
import { Globe, MapPin, RefreshCw } from 'lucide-react';
import { ThreatMapPoint } from '@/shared';
import { fetchApi } from '@/lib/api-client';
import { useConnectedWebsite } from '@/lib/aegis-website';

interface ThreatMapViewProps {
  threatPoints?: ThreatMapPoint[];
}

export function ThreatMapView({ threatPoints: initialPoints }: ThreatMapViewProps) {
  const { connectedSite, isConnected } = useConnectedWebsite();
  const [points, setPoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchThreatMap = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi('/alerts/threat-map');
      if (data && Array.isArray(data)) {
        setPoints(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatMap();
  }, []);

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Target Website Connected</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Please connect your website URL in the <strong className="text-white">"Connect Website"</strong> section to render global threat telemetry vectors targeting your domain.
          </p>
        </div>
      </div>
    );
  }

  const displayPoints = points.length > 0 ? points : initialPoints || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-neutral-800/80 rounded-xl p-4 sm:p-6 bg-neutral-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <Globe className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold text-white tracking-tight">Global Threat Map</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time geographic threat vector nodes monitiored live across active session edge nodes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:space-x-4 text-xs font-mono">
          <button
            onClick={fetchThreatMap}
            className="p-2 rounded-lg bg-neutral-800 border border-neutral-700/60 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Refresh Threat Map"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Authorized Nodes</span>
          </div>
          <div className="flex items-center space-x-1.5 text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Active Threats</span>
          </div>
        </div>
      </div>

      {/* Grid Map Visualizer */}
      <div className="border border-neutral-800/80 rounded-xl p-6 relative min-h-[320px] bg-neutral-950/60 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#26262615_1px,transparent_1px),linear-gradient(to_bottom,#26262615_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPoints.map((pt) => {
            const risk = pt.riskScore || (pt.severity === 'HIGH' || pt.severity === 'CRITICAL' ? 0.88 : 0.10);
            const isHigh = risk >= 0.70;
            return (
              <div
                key={pt.id}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isHigh
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-neutral-800/80 bg-neutral-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className={`w-4 h-4 ${isHigh ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-xs text-neutral-200">{pt.location || `${pt.city}, ${pt.country}`}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                      isHigh ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {(risk * 100).toFixed(0)}% RISK
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="text-neutral-300 font-mono text-[11px]">{pt.type || pt.attackType || 'TELEMETRY_SESSION'}</div>
                  {pt.ipAddress && <div className="text-[11px] text-neutral-500 font-mono">IP: {pt.ipAddress}</div>}
                  <div className="text-[10px] text-neutral-600">Lat: {pt.lat}, Lng: {pt.lng}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
