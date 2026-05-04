// Shared chart styling tokens.

export const CHART_AXIS = {
  fontSize: 11,
  fill: '#6b7280',
  fontFamily: 'inherit',
};

export const CHART_GRID = '#eef0f3';

export const ACCENT = '#FF3246';
export const ACCENT_SOFT = '#ffd6db';
export const NEUTRAL = '#94a3b8';
export const NEUTRAL_SOFT = '#cbd5e1';
export const POSITIVE = '#1a8754';
export const NEGATIVE = '#c43e3e';
export const AMBER = '#d49a1a';

export const SEGMENT_COLORS: Record<string, string> = {
  Enterprise: '#FF3246',
  'Mid-market': '#1a3468',
  Channel: '#d49a1a',
  'Long tail': '#667885',
};

export const chartTooltipStyle = {
  background: '#0f172a',
  border: 'none',
  borderRadius: 6,
  fontSize: 12,
  color: '#fff',
  padding: '6px 10px',
};

export const chartTooltipItemStyle = { color: '#fff' };
export const chartTooltipLabelStyle = { color: '#cbd5e1', fontSize: 11 };
