# Database Migration Deployment Instructions

## Phase 08: Dashboard Widgets System

### Manual Deployment Required

Due to migration sync issues, please deploy the migration manually:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `crypto-pattern-scanner`
   - Navigate to: SQL Editor

2. **Run Migration**
   - Copy the contents of `20250120_add_dashboard_widgets.sql`
   - Paste into SQL Editor
   - Click "Run" button

3. **Verify Deployment**
   Run these verification queries:

   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('dashboard_widgets', 'manifestation_goals', 'scheduled_notifications');

   -- Check RLS enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('dashboard_widgets', 'manifestation_goals', 'scheduled_notifications');

   -- Check policies
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE tablename IN ('dashboard_widgets', 'manifestation_goals', 'scheduled_notifications');

   -- Check ENUMs
   SELECT typname FROM pg_type WHERE typtype = 'e' AND typname IN ('widget_type', 'widget_size');
   ```

4. **Expected Results**
   - 3 tables created
   - RLS enabled on all 3 tables
   - 12 policies created (4 per table)
   - 2 ENUMs created
   - 2 triggers created

## Alternative: CLI Deployment (if sync issues resolved)

```bash
# Option 1: Repair and push
npx supabase migration repair --status reverted 20241117
npx supabase db push

# Option 2: Pull remote, then push
npx supabase db pull
npx supabase db push
```

## Troubleshooting

If you encounter errors:

1. **Type already exists**: The ENUMs might already exist, you can skip that part
2. **Table already exists**: Check if tables were partially created, may need to drop and recreate
3. **Permission errors**: Ensure you're running as a superuser

## After Deployment

✅ Verify all 3 tables exist
✅ Test RLS policies work
✅ Confirm triggers fire on UPDATE
✅ Test widget creation in frontend

---

**Created:** 2025-01-20
**Phase:** 08 - Widget Factory & Database
