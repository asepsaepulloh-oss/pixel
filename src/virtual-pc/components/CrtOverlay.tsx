import React from 'react';
import { useDesktop } from '../context/DesktopContext';

export const CrtOverlay: React.FC = () => {
  const { settings } = useDesktop();

  if (!settings.crtFilterEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Subtle scanline stripes */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px'
        }}
      />
      {/* CRT screen corner vignette curvature */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at center, transparent 70%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      />
    </div>
  );
};
