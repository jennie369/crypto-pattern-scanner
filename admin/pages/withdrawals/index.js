/**
 * Withdrawals Management Page
 * Coming soon placeholder
 */

import React from 'react';

export default function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-gray-400 mt-1">Manage partner withdrawal requests</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Withdrawal management with approval workflows and payment tracking will be available in Phase 2.
        </p>
      </div>
    </div>
  );
}
