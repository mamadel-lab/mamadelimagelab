import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyBadge() {
  return (
    <div className="privacy-badge flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5">
      <ShieldCheck size={13} />
      <span className="hidden xs:inline text-xs font-semibold" style={{ letterSpacing: '0.02em' }}>
        100% Private
      </span>
    </div>
  );
}