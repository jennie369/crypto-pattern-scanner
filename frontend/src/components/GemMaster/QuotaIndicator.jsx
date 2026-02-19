/**
 * QuotaIndicator - Web component
 * Progress bar showing daily usage (e.g., "3/10 chats used").
 * Color changes as quota depletes (green -> yellow -> red).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, ANIMATION } from '../../../../web design-tokens';

const getQuotaColor = (ratio) => {
  if (ratio < 0.5) return COLORS.success;
  if (ratio < 0.8) return COLORS.warning;
  return COLORS.error;
};

const getQuotaBg = (ratio) => {
  if (ratio < 0.5) return 'rgba(58, 247, 166, 0.15)';
  if (ratio < 0.8) return 'rgba(255, 184, 0, 0.15)';
  return 'rgba(255, 107, 107, 0.15)';
};

const QuotaIndicator = ({
  used = 0,
  total = 10,
  label = 'chats',
  showBar = true,
  showIcon = true,
  size = 'medium',
  style: customStyle,
}) => {
  const isUnlimited = total === Infinity || total === -1;
  const ratio = isUnlimited ? 0 : Math.min(used / total, 1);
  const remaining = isUnlimited ? Infinity : Math.max(total - used, 0);
  const isExhausted = !isUnlimited && used >= total;
  const color = getQuotaColor(ratio);
  const bgColor = getQuotaBg(ratio);

  const sizeConfig = {
    small: { barHeight: 4, fontSize: TYPOGRAPHY.fontSize.xs, padding: `${SPACING.xs}px ${SPACING.sm}px`, iconSize: 12 },
    medium: { barHeight: 6, fontSize: TYPOGRAPHY.fontSize.sm, padding: `${SPACING.sm}px ${SPACING.md}px`, iconSize: 14 },
    large: { barHeight: 8, fontSize: TYPOGRAPHY.fontSize.base, padding: `${SPACING.md}px ${SPACING.base}px`, iconSize: 16 },
  }[size] || { barHeight: 6, fontSize: TYPOGRAPHY.fontSize.sm, padding: `${SPACING.sm}px ${SPACING.md}px`, iconSize: 14 };

  return (
    <div
      role="progressbar"
      aria-valuenow={used}
      aria-valuemin={0}
      aria-valuemax={isUnlimited ? undefined : total}
      aria-label={`${label}: ${isUnlimited ? `${used} used (unlimited)` : `${used} of ${total} used`}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.xs,
        padding: sizeConfig.padding,
        borderRadius: RADIUS.sm,
        background: bgColor,
        minHeight: 44,
        justifyContent: 'center',
        ...customStyle,
      }}
    >
      {/* Label Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.sm,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
          {showIcon && (
            isExhausted
              ? <AlertTriangle size={sizeConfig.iconSize} color={COLORS.error} />
              : <Zap size={sizeConfig.iconSize} color={color} />
          )}
          <span style={{
            fontSize: sizeConfig.fontSize,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
            color: COLORS.textSecondary,
          }}>
            {label}
          </span>
        </div>
        <span style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: color,
        }}>
          {isUnlimited ? (
            <>{used} used</>
          ) : (
            <>{used}/{total}</>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      {showBar && !isUnlimited && (
        <div style={{
          width: '100%',
          height: sizeConfig.barHeight,
          borderRadius: sizeConfig.barHeight / 2,
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: sizeConfig.barHeight / 2,
              background: color,
              boxShadow: isExhausted ? `0 0 8px ${COLORS.error}` : 'none',
            }}
          />
        </div>
      )}

      {/* Warning text when nearly exhausted */}
      {!isUnlimited && ratio >= 0.8 && !isExhausted && (
        <span style={{
          fontSize: TYPOGRAPHY.fontSize.xs,
          color: COLORS.warning,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        }}>
          {remaining} remaining today
        </span>
      )}
      {isExhausted && (
        <span style={{
          fontSize: TYPOGRAPHY.fontSize.xs,
          color: COLORS.error,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
        }}>
          Daily limit reached. Upgrade for more!
        </span>
      )}
    </div>
  );
};

export default QuotaIndicator;
