/**
 * Brand color palette for the Food Delivery App.
 * Designed to be accessible (WCAG AA contrast on white/black backgrounds).
 */
export const Colors = {
  // Brand
  primary:        '#FF6B35',   // Orange — main CTA
  primaryLight:   '#FF8C5A',
  primaryDark:    '#E55A28',
  secondary:      '#2D9CDB',   // Blue — info, links
  accent:         '#F2994A',   // Amber — highlights

  // Semantic
  success:        '#27AE60',
  successLight:   '#E8F8EF',
  warning:        '#F2C94C',
  warningLight:   '#FFF8E1',
  error:          '#EB5757',
  errorLight:     '#FDECEA',
  info:           '#2D9CDB',
  infoLight:      '#E8F4FD',

  // Neutrals
  white:          '#FFFFFF',
  black:          '#0A0A0A',
  background:     '#F8F9FA',
  surface:        '#FFFFFF',
  border:         '#E8E8E8',
  divider:        '#F0F0F0',

  // Text
  textPrimary:    '#1A1A1A',
  textSecondary:  '#6B7280',
  textDisabled:   '#C4C4C4',
  textInverse:    '#FFFFFF',
  textPlaceholder:'#9CA3AF',

  // Status chips
  statusPending:    '#FFF3E0',
  statusConfirmed:  '#E3F2FD',
  statusPreparing:  '#FFF8E1',
  statusReady:      '#E8F5E9',
  statusOnWay:      '#E3F2FD',
  statusDelivered:  '#E8F5E9',
  statusCancelled:  '#FDECEA',

  // Overlay
  overlay:          'rgba(0,0,0,0.5)',
  overlayLight:     'rgba(0,0,0,0.3)',

  // Rating
  star:             '#F2C94C',
  starEmpty:        '#E8E8E8',
} as const;

export type ColorKey = keyof typeof Colors;
