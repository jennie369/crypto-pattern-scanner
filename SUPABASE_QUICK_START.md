# 🚀 Supabase Quick Start - GEM Trading Platform

## ⚡ Fast Setup (5 Minutes)

### 1️⃣ Create Supabase Project
```
📍 URL: https://supabase.com
🎯 Project Name: gem-trading-platform
🌏 Region: Singapore
⏱️ Wait: 3-5 minutes
```

### 2️⃣ Get Credentials
```
📋 Go to: Settings > API
📝 Copy:
   - Project URL
   - Anon Public Key
```

### 3️⃣ Configure Frontend
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4️⃣ Deploy Schema
```sql
-- Go to: SQL Editor > New Query
-- Copy schema from SUPABASE_SETUP.md (STEP 4)
-- Run the query
-- ✅ Verify: 3 tables created (users, daily_scan_quota, scan_history)
```

### 5️⃣ Start Development
```bash
npm run dev
```

---

## 🎯 Files Created

```
frontend/
├── src/
│   ├── lib/
│   │   └── supabaseClient.js      # Supabase configuration
│   └── hooks/
│       ├── useAuth.js              # Authentication hook
│       ├── useQuota.js             # Quota management
│       └── useScanHistory.js       # Scan history
├── .env.local.example              # Environment template
└── .env.local                      # Your credentials (DO NOT COMMIT!)
```

---

## 📚 Hook Usage

### useAuth - User Authentication
```jsx
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, profile, signIn, signOut, signUp } = useAuth();

  // Sign up
  const handleSignUp = async () => {
    await signUp('email@example.com', 'password', 'Full Name');
  };

  // Sign in
  const handleSignIn = async () => {
    await signIn('email@example.com', 'password');
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {profile?.full_name}</p>
          <p>Tier: {profile?.tier}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      )}
    </div>
  );
}
```

### useQuota - Scan Quota Management
```jsx
import { useQuota } from './hooks/useQuota';

function Scanner() {
  const { quota, checkQuota, incrementScan, getQuotaSummary } = useQuota();

  const handleScan = async () => {
    // Check if user can scan
    const { canScan, remaining, reason } = checkQuota();

    if (!canScan) {
      alert(reason); // "Daily scan limit reached..."
      return;
    }

    // Perform scan...
    const results = await performScan();

    // Increment quota after successful scan
    await incrementScan();

    console.log(`Scans remaining: ${remaining - 1}`);
  };

  // Get quota summary
  const summary = getQuotaSummary();
  // { used: 2, remaining: 3, total: 5, percentUsed: 40, canScan: true }

  return (
    <div>
      <p>Scans: {summary?.used} / {summary?.total}</p>
      <button onClick={handleScan} disabled={!summary?.canScan}>
        Run Scan
      </button>
    </div>
  );
}
```

### useScanHistory - Scan History Tracking
```jsx
import { useScanHistory } from './hooks/useScanHistory';

function History() {
  const { history, saveScan, deleteScan, getStats } = useScanHistory();

  const handleNewScan = async () => {
    // Save scan to history
    await saveScan({
      symbols: ['BTCUSDT', 'ETHUSDT'],
      patternsFound: {
        BTCUSDT: { pattern: 'UPU', confidence: 0.85 },
        ETHUSDT: { pattern: 'DPD', confidence: 0.78 }
      },
      timeframe: '1h'
    });
  };

  // Get statistics
  const stats = getStats();
  // { totalScans: 15, totalPatterns: 30, mostScannedSymbol: 'BTCUSDT' }

  return (
    <div>
      <h3>Scan History ({history.length})</h3>
      <p>Total Patterns: {stats.totalPatterns}</p>

      {history.map(scan => (
        <div key={scan.id}>
          <p>Symbols: {scan.symbols.join(', ')}</p>
          <p>Time: {new Date(scan.created_at).toLocaleString()}</p>
          <button onClick={() => deleteScan(scan.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Tier System

| Tier | Scans/Day | Price | Features |
|------|-----------|-------|----------|
| FREE | 5 | $0 | Basic scanning |
| Tier 1 | Unlimited | $10/mo | + Real-time alerts |
| Tier 2 | Unlimited | $25/mo | + Advanced patterns |
| Tier 3 | Unlimited | $50/mo | + AI predictions |

---

## 🔐 Security Features

✅ Row Level Security (RLS) enabled
✅ Users can only access their own data
✅ Email/Password authentication
✅ Session management
✅ Automatic token refresh

---

## 🚨 Common Issues

### "Missing environment variables"
```bash
# Solution: Create .env.local file
cp .env.local.example .env.local
# Then add your credentials
```

### "Quota not loaded"
```js
// Solution: Make sure user is signed in
const { user } = useAuth();
if (!user) {
  // Redirect to login
}
```

### "Can't save scan history"
```sql
-- Solution: Check RLS policies in Supabase
-- Go to: Authentication > Policies
-- Verify INSERT policy exists for scan_history
```

---

## 📊 Database Schema

```
users
├── id (UUID, PK)
├── email (TEXT, UNIQUE)
├── full_name (TEXT)
├── tier (TEXT: free, tier1, tier2, tier3)
└── tier_expires_at (TIMESTAMP)

daily_scan_quota
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── scan_count (INT)
├── max_scans (INT, default: 5)
└── last_reset_at (TIMESTAMP)

scan_history
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── symbols (TEXT[])
├── patterns_found (JSONB)
├── timeframe (TEXT)
├── tier_at_scan (TEXT)
└── created_at (TIMESTAMP)
```

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] Credentials copied to .env.local
- [ ] Database schema deployed
- [ ] Tables visible in dashboard
- [ ] RLS policies enabled
- [ ] Email auth enabled
- [ ] Test user created
- [ ] Frontend hooks working
- [ ] Quota tracking works
- [ ] History saves correctly

---

## 📖 Full Documentation

See `SUPABASE_SETUP.md` for complete setup guide with:
- Detailed step-by-step instructions
- Complete SQL schema
- Troubleshooting guide
- Security checklist
- Next steps

---

**🎉 Ready to build!**
