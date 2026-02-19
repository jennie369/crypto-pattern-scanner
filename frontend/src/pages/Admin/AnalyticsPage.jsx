import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from './adminUtils';
import {
  Users,
  User,
  Award,
  Crown,
  Gem,
  Search,
  CircleDollarSign,
  BarChart3,
  FileText,
  Wallet,
  DollarSign,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    adminUsers: 0,
    totalScans: 0,
    totalAffiliates: 0,
    totalCtvs: 0,
    pendingApplications: 0,
    pendingWithdrawals: 0,
    totalCommissions: 0,
  });

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadAnalytics();
    }
  }, [user, profile?.role]);

  const loadAnalytics = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analytics request timeout')), 10000)
      );

      const usersQuery = supabase
        .from('profiles')
        .select('scanner_tier, role');

      const { data: usersData, error: usersError } = await Promise.race([usersQuery, timeoutPromise]);

      if (usersError) throw usersError;

      const tierCounts = usersData.reduce((acc, user) => {
        if (user.role === 'admin') {
          acc.adminUsers++;
        } else if (!user.scanner_tier || user.scanner_tier === 'FREE') {
          acc.freeUsers++;
        } else {
          acc.premiumUsers++;
        }
        acc.totalUsers++;
        return acc;
      }, { totalUsers: 0, freeUsers: 0, premiumUsers: 0, adminUsers: 0 });

      const scansQuery = supabase
        .from('scan_history')
        .select('id', { count: 'exact', head: true });

      const { data: scansData } = await Promise.race([scansQuery, timeoutPromise]);

      const { data: partnerStats } = await supabase
        .from('profiles')
        .select('partner_role, partner_tier')
        .not('partner_role', 'is', null);

      let affiliateCount = 0;
      let ctvCount = 0;
      if (partnerStats) {
        partnerStats.forEach(p => {
          if (p.partner_role === 'affiliate') affiliateCount++;
          if (p.partner_role === 'ctv') ctvCount++;
        });
      }

      const { count: pendingApps } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingWithdrs } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'approved', 'processing']);

      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount');

      const totalCommissions = commissionsData?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

      setAnalytics({
        ...tierCounts,
        totalScans: scansData || 0,
        totalAffiliates: affiliateCount,
        totalCtvs: ctvCount,
        pendingApplications: pendingApps || 0,
        pendingWithdrawals: pendingWithdrs || 0,
        totalCommissions,
      });

      console.log('Analytics loaded:', tierCounts);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  return (
    <div className="tab-content">
      <h2>System Analytics</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-icon"><Users size={32} /></div>
          <div className="card-content">
            <div className="card-label">Total Users</div>
            <div className="card-value">{analytics.totalUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon"><CircleDollarSign size={32} /></div>
          <div className="card-content">
            <div className="card-label">Free Tier</div>
            <div className="card-value">{analytics.freeUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon"><Gem size={32} /></div>
          <div className="card-content">
            <div className="card-label">Premium Users</div>
            <div className="card-value">{analytics.premiumUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon"><Crown size={32} /></div>
          <div className="card-content">
            <div className="card-label">Admin Users</div>
            <div className="card-value">{analytics.adminUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon"><Search size={32} /></div>
          <div className="card-content">
            <div className="card-label">Total Scans</div>
            <div className="card-value">{analytics.totalScans.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <h3 style={{ color: '#FFBD59', margin: '32px 0 16px', fontSize: '18px' }}>
        Partnership Stats
      </h3>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-icon" style={{ color: '#0ECB81' }}><User size={32} /></div>
          <div className="card-content">
            <div className="card-label">Affiliates</div>
            <div className="card-value">{analytics.totalAffiliates}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ color: '#F0B90B' }}><Award size={32} /></div>
          <div className="card-content">
            <div className="card-label">CTVs</div>
            <div className="card-value">{analytics.totalCtvs}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ color: '#F6465D' }}><FileText size={32} /></div>
          <div className="card-content">
            <div className="card-label">Don cho duyet</div>
            <div className="card-value">{analytics.pendingApplications}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ color: '#F6465D' }}><Wallet size={32} /></div>
          <div className="card-content">
            <div className="card-label">Rut tien cho xu ly</div>
            <div className="card-value">{analytics.pendingWithdrawals}</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ color: '#0ECB81' }}><DollarSign size={32} /></div>
          <div className="card-content">
            <div className="card-label">Tong Commission</div>
            <div className="card-value" style={{ fontSize: '20px' }}>{formatCurrency(analytics.totalCommissions)}</div>
          </div>
        </div>
      </div>

      <div className="chart-placeholder">
        <div className="placeholder-icon"><BarChart3 size={64} /></div>
        <div className="placeholder-text">Real-time Analytics Dashboard</div>
      </div>
    </div>
  );
}
