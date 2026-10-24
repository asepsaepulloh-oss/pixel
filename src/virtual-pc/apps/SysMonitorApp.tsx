import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, ShieldAlert } from 'lucide-react';

export const SysMonitorApp: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [history, setHistory] = useState<number[]>([12, 15, 22, 18, 30, 25, 20, 18]);
  const [ramUsedMb, setRamUsedMb] = useState<number>(412);
  const [packets, setPackets] = useState<number>(1024);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate dynamic fluctuation
      const newCpu = Math.max(8, Math.min(95, Math.floor(20 + Math.sin(Date.now() / 2000) * 15 + Math.random() * 10)));
      setCpuUsage(newCpu);
      setHistory(prev => [...prev.slice(-15), newCpu]);
      setRamUsedMb(prev => Math.min(1024, Math.max(380, prev + Math.floor((Math.random() - 0.48) * 8))));
      setPackets(prev => prev + Math.floor(Math.random() * 5));
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 bg-[#14151b] p-4 font-mono text-xs text-gray-200 space-y-4 select-none overflow-y-auto">
      {/* Simulation Banner */}
      <div className="p-2 bg-amber-950/40 border border-amber-700/60 rounded flex items-center space-x-2 text-amber-200 text-[11px]">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>Notice: Displayed metrics are simulated within Pixel PC, not host OS measurements.</span>
      </div>

      {/* CPU Usage Meter & History Graph */}
      <div className="bg-[#191b22] border border-[#2d313d] rounded p-3 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-[#4ade80]">
            <Cpu className="w-4 h-4" />
            <span className="font-bold">Simulated CPU Load:</span>
          </div>
          <span className="text-sm font-bold text-[#4ade80]">{cpuUsage}%</span>
        </div>

        {/* Bar */}
        <div className="w-full bg-[#0d0e12] h-3 rounded overflow-hidden border border-[#2a2e3a]">
          <div
            className="h-full bg-gradient-to-r from-[#4ade80] via-[#ffb347] to-[#f87171] transition-all duration-500"
            style={{ width: `${cpuUsage}%` }}
          />
        </div>

        {/* History Sparkline */}
        <div className="pt-2">
          <div className="text-[10px] text-gray-500 mb-1">Load History (Past 15 ticks):</div>
          <div className="flex items-end h-12 bg-[#0e0f14] p-1 rounded border border-[#262933] space-x-1">
            {history.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-[#4ade80]/70 hover:bg-[#4ade80] rounded-t transition-all"
                style={{ height: `${val}%` }}
                title={`${val}%`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Memory Usage Meter */}
      <div className="bg-[#191b22] border border-[#2d313d] rounded p-3 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-[#38bdf8]">
            <HardDrive className="w-4 h-4" />
            <span className="font-bold">Simulated RAM:</span>
          </div>
          <span className="text-sm font-bold text-[#38bdf8]">
            {ramUsedMb} MB / 1024 MB
          </span>
        </div>

        <div className="w-full bg-[#0d0e12] h-3 rounded overflow-hidden border border-[#2a2e3a]">
          <div
            className="h-full bg-[#38bdf8] transition-all duration-500"
            style={{ width: `${(ramUsedMb / 1024) * 100}%` }}
          />
        </div>
      </div>

      {/* Network / Gateway Stats */}
      <div className="bg-[#191b22] border border-[#2d313d] rounded p-3 space-y-2">
        <div className="flex items-center space-x-2 text-[#ffb347]">
          <Wifi className="w-4 h-4" />
          <span className="font-bold">9Router Gateway Activity:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="bg-[#0e0f14] p-2 rounded border border-[#262933]">
            <div className="text-gray-500">Packets Processed:</div>
            <div className="text-[#ffb347] font-bold text-sm">{packets}</div>
          </div>
          <div className="bg-[#0e0f14] p-2 rounded border border-[#262933]">
            <div className="text-gray-500">Gateway Status:</div>
            <div className="text-green-400 font-bold text-sm">ONLINE</div>
          </div>
        </div>
      </div>
    </div>
  );
};
