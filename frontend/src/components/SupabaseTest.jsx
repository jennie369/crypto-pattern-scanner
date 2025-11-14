/**
 * Supabase Connection Test Component
 * Quick UI to test Supabase integration
 */

import { useState } from 'react';
import { testSupabaseConnection, testSignUp, testSignIn } from '../utils/testSupabase';
import { useAuth } from '../hooks/useAuth';
import { useQuota } from '../hooks/useQuota';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState(null);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test123456');

  const { user, profile, signIn, signUp, signOut } = useAuth();
  const { quota, checkQuota, getQuotaSummary } = useQuota();

  const handleTestConnection = async () => {
    const result = await testSupabaseConnection();
    setTestResult(result);
  };

  const handleSignUp = async () => {
    const result = await signUp(email, password, 'Test User');
    setTestResult(result);
  };

  const handleSignIn = async () => {
    const result = await signIn(email, password);
    setTestResult(result);
  };

  const quotaSummary = getQuotaSummary();
  const quotaCheck = checkQuota();

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '20px auto',
      background: 'rgba(17, 34, 80, 0.9)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 189, 89, 0.3)'
    }}>
      <h2 style={{ color: '#FFBD59', marginBottom: '20px' }}>
        🧪 Supabase Test Dashboard
      </h2>

      {/* Connection Test */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#DEBC81', fontSize: '16px' }}>1. Test Connection</h3>
        <button
          onClick={handleTestConnection}
          style={{
            padding: '10px 20px',
            background: '#FFBD59',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Test Supabase Connection
        </button>
      </div>

      {/* Auth Test */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#DEBC81', fontSize: '16px' }}>2. Test Authentication</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 189, 89, 0.3)',
              borderRadius: '4px',
              color: 'white'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 189, 89, 0.3)',
              borderRadius: '4px',
              color: 'white'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSignUp} style={buttonStyle}>Sign Up</button>
          <button onClick={handleSignIn} style={buttonStyle}>Sign In</button>
          {user && <button onClick={signOut} style={buttonStyle}>Sign Out</button>}
        </div>
      </div>

      {/* User Status */}
      {user && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(14, 203, 129, 0.1)',
          border: '1px solid rgba(14, 203, 129, 0.3)',
          borderRadius: '6px'
        }}>
          <h3 style={{ color: '#0ECB81', fontSize: '16px', marginBottom: '10px' }}>
            ✅ Logged In
          </h3>
          <p style={{ color: '#DEBC81', fontSize: '14px', margin: '5px 0' }}>
            Email: {user.email}
          </p>
          <p style={{ color: '#DEBC81', fontSize: '14px', margin: '5px 0' }}>
            Tier: {profile?.tier?.toUpperCase() || 'Loading...'}
          </p>
        </div>
      )}

      {/* Quota Status */}
      {user && quotaSummary && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(255, 189, 89, 0.1)',
          border: '1px solid rgba(255, 189, 89, 0.3)',
          borderRadius: '6px'
        }}>
          <h3 style={{ color: '#FFBD59', fontSize: '16px', marginBottom: '10px' }}>
            📊 Quota Status
          </h3>
          <p style={{ color: '#DEBC81', fontSize: '14px', margin: '5px 0' }}>
            Used: {quotaSummary.used} / {quotaSummary.total} scans
          </p>
          <p style={{ color: '#DEBC81', fontSize: '14px', margin: '5px 0' }}>
            Remaining: {quotaSummary.remaining}
          </p>
          <p style={{ color: '#DEBC81', fontSize: '14px', margin: '5px 0' }}>
            Can Scan: {quotaCheck.canScan ? '✅ Yes' : '❌ No'}
          </p>
          {!quotaCheck.canScan && (
            <p style={{ color: '#F6465D', fontSize: '12px', marginTop: '10px' }}>
              {quotaCheck.reason}
            </p>
          )}
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: testResult.success
            ? 'rgba(14, 203, 129, 0.1)'
            : 'rgba(246, 70, 93, 0.1)',
          border: `1px solid ${testResult.success ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)'}`,
          borderRadius: '6px'
        }}>
          <h3 style={{
            color: testResult.success ? '#0ECB81' : '#F6465D',
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            {testResult.success ? '✅ Success' : '❌ Error'}
          </h3>
          <pre style={{
            color: '#DEBC81',
            fontSize: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: '8px 16px',
  background: 'rgba(255, 189, 89, 0.2)',
  border: '1px solid rgba(255, 189, 89, 0.3)',
  borderRadius: '4px',
  color: '#FFBD59',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px'
};
