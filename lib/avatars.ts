function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getAvatarDataUri(fullName: string, bgHex = '#1d4ed8'): string {
  const clean = (fullName || 'Agent OS').trim();
  const parts = clean.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="64" fill="${bgHex}"/>
    <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="46" font-weight="700">${escapeXml(initials)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCampaignBannerDataUri(theme: 'auto' | 'home' | 'health' | 'business'): string {
  const palettes: Record<typeof theme, { bg1: string; bg2: string; accent: string; label: string }> = {
    auto: { bg1: '#0f172a', bg2: '#1e3a8a', accent: '#38bdf8', label: 'AUTO PROTECTION' },
    home: { bg1: '#064e3b', bg2: '#0f766e', accent: '#34d399', label: 'HOME & ENFIA SHIELD' },
    health: { bg1: '#1e1b4b', bg2: '#312e81', accent: '#818cf8', label: 'HEALTH & FAMILY CARE' },
    business: { bg1: '#1c1917', bg2: '#334155', accent: '#f59e0b', label: 'COMMERCIAL LIABILITY' },
  };
  const p = palettes[theme];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.bg1}"/>
        <stop offset="100%" stop-color="${p.bg2}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="628" fill="url(#g)"/>
    <circle cx="1020" cy="140" r="240" fill="${p.accent}" fill-opacity="0.12"/>
    <circle cx="180" cy="540" r="200" fill="${p.accent}" fill-opacity="0.08"/>
    <rect x="80" y="96" width="120" height="6" rx="3" fill="${p.accent}"/>
    <text x="80" y="156" fill="${p.accent}" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="700" letter-spacing="3">${escapeXml(p.label)}</text>
    <text x="80" y="250" fill="#ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="56" font-weight="800">Comprehensive Coverage.</text>
    <text x="80" y="325" fill="#cbd5e1" font-family="system-ui,-apple-system,sans-serif" font-size="36" font-weight="500">Instant Multi-Carrier Quotes &amp; Advisory</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
