/**
 * Hook to check and manage Trading Leads Pro Scanner benefit
 * Shows modal when user is eligible for free Pro Scanner
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import tradingLeadsService from '../services/tradingLeadsService';

export const useTradingLeadsBenefit = () => {
  const { user, profile } = useAuth();
  const [benefitInfo, setBenefitInfo] = useState(null);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProScannerBenefit, setHasProScannerBenefit] = useState(false);

  // Check eligibility when user logs in
  const checkBenefit = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      // Check if we've already shown the modal this session
      const alreadyChecked = await tradingLeadsService.hasBenefitBeenChecked();

      // Check eligibility from database
      const benefit = await tradingLeadsService.checkEligibility(user.email);

      if (benefit) {
        setBenefitInfo(benefit);

        if (benefit.eligible && benefit.activated && !benefit.expired) {
          // User has active Pro Scanner from trading leads
          setHasProScannerBenefit(true);
          console.log('[TradingLeads] User has active Pro Scanner:', benefit.daysRemaining, 'days remaining');
        } else if (benefit.eligible && !benefit.activated && !alreadyChecked) {
          // Eligible but not activated - show modal
          console.log('[TradingLeads] Eligible for Pro Scanner, showing modal');
          setShowBenefitModal(true);
        }
      }
    } catch (error) {
      console.error('[TradingLeads] Check benefit error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Run check on mount and when user changes
  useEffect(() => {
    checkBenefit();
  }, [checkBenefit]);

  // Handle modal close
  const closeBenefitModal = useCallback(() => {
    setShowBenefitModal(false);
  }, []);

  // Handle successful activation
  const onBenefitActivated = useCallback((result) => {
    setHasProScannerBenefit(true);
    setBenefitInfo(prev => ({
      ...prev,
      activated: true,
      expiresAt: result.expiresAt,
      daysRemaining: result.days,
    }));
    console.log('[TradingLeads] Pro Scanner activated successfully');
  }, []);

  // Manually trigger check (e.g., after profile update)
  const recheckBenefit = useCallback(async () => {
    await tradingLeadsService.resetBenefitCheck();
    await checkBenefit();
  }, [checkBenefit]);

  return {
    // State
    benefitInfo,
    showBenefitModal,
    loading,
    hasProScannerBenefit,

    // Actions
    closeBenefitModal,
    onBenefitActivated,
    recheckBenefit,

    // For modal props
    userEmail: user?.email,
    userId: user?.id,
  };
};

export default useTradingLeadsBenefit;
