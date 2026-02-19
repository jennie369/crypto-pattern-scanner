/**
 * VoiceQuotaDisplay - Shows voice quota usage for current tier
 * Part of GemMaster web port Stream E
 */

import React from 'react';
import { Mic } from 'lucide-react';
import './VoiceQuotaDisplay.css';

const VoiceQuotaDisplay = ({ used = 0, total = 0, tier = 'FREE' }) => {
  const isUnlimited = tier === 'TIER3' || tier === 'VIP' || tier === 'ADMIN';
  const percentage = isUnlimited ? 100 : (total > 0 ? Math.min((used / total) * 100, 100) : 0);
  const remaining = isUnlimited ? null : Math.max(total - used, 0);

  return (
    <div className="voice-quota">
      <div className="voice-quota__header">
        <Mic size={14} />
        <span className="voice-quota__label">
          {isUnlimited
            ? `${used} tin nhan giong noi`
            : `${used}/${total} tin nhan giong noi`
          }
        </span>
      </div>
      <div className="voice-quota__bar">
        <div
          className={`voice-quota__fill ${remaining === 0 && !isUnlimited ? 'voice-quota__fill--depleted' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!isUnlimited && remaining === 0 && (
        <span className="voice-quota__warning">Da het luot giong noi hom nay</span>
      )}
    </div>
  );
};

export default VoiceQuotaDisplay;
