# 📚 Library Documentation

## Supabase Client (`supabaseClient.js`)

### Overview
Centralized Supabase client configuration for the GEM Trading Platform.

### Exports

#### `supabase`
Main Supabase client instance.
```js
import { supabase } from './lib/supabaseClient';

// Query database
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

#### `isSupabaseConfigured()`
Check if Supabase environment variables are set.
```js
import { isSupabaseConfigured } from './lib/supabaseClient';

if (!isSupabaseConfigured()) {
  console.error('Supabase not configured!');
}
```

#### `getCurrentUser()`
Get currently authenticated user.
```js
import { getCurrentUser } from './lib/supabaseClient';

const user = await getCurrentUser();
if (user) {
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
}
```

#### `getUserProfile(userId)`
Get user profile with tier information.
```js
import { getUserProfile } from './lib/supabaseClient';

const profile = await getUserProfile(userId);
console.log('Tier:', profile.tier);
console.log('Name:', profile.full_name);
```

### Configuration

Requires `.env.local` file with:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Features

- ✅ Auto token refresh
- ✅ Persistent sessions (localStorage)
- ✅ URL session detection
- ✅ Environment validation
- ✅ Error handling

### Example Usage

```js
import { supabase } from './lib/supabaseClient';

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Database queries
const { data: scans } = await supabase
  .from('scan_history')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// Realtime subscriptions
const channel = supabase
  .channel('scan-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'scan_history'
  }, (payload) => {
    console.log('New scan:', payload.new);
  })
  .subscribe();
```

### Error Handling

```js
try {
  const user = await getCurrentUser();
  if (!user) {
    // Not authenticated
  }
} catch (error) {
  console.error('Auth error:', error);
}
```
