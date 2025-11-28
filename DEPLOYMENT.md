# 🚀 Gemral Deployment Guide

Complete guide for deploying Gemral to Vercel with Supabase backend.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start - Vercel Dashboard](#quick-start---vercel-dashboard)
3. [Alternative - Vercel CLI](#alternative---vercel-cli)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Checks](#post-deployment-checks)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [x] **Supabase Project:** Active project with all tables and Edge Functions deployed
- [x] **GitHub Repository:** Code pushed to GitHub (https://github.com/jennie369/crypto-pattern-scanner)
- [x] **Vercel Account:** Free account at https://vercel.com
- [x] **Environment Variables:** Supabase URL and Anon Key ready

**Required Node.js Version:** ≥18.0.0 (specified in `package.json`)

---

## 🎯 Quick Start - Vercel Dashboard

### **Method 1: GitHub Integration (Recommended)**

This method provides automatic deployments on every git push.

#### **Step 1: Import Project**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose: `jennie369/crypto-pattern-scanner`
5. Click **"Import"**

#### **Step 2: Configure Build Settings**

Vercel will auto-detect Vite. Verify these settings:

```
Framework Preset:     Vite
Root Directory:       ./              (leave default)
Build Command:        cd frontend && npm run build
Output Directory:     frontend/dist
Install Command:      cd frontend && npm install
```

#### **Step 3: Add Environment Variables**

Click **"Environment Variables"** and add:

| Key | Value | Environments |
|-----|-------|--------------|
| `VITE_SUPABASE_URL` | `https://pgfkbcnzqozzkohwbgbk.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | `your_gemini_api_key` (optional) | Production |

**⚠️ IMPORTANT:** Get your Supabase credentials from:
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/settings/api

#### **Step 4: Deploy**

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Visit your live site: `https://your-project.vercel.app`

---

## 🔧 Alternative - Vercel CLI

For developers who prefer command-line deployment.

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login**

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### **Step 3: Deploy**

```bash
# Navigate to project root
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Deploy to production
vercel --prod
```

### **Step 4: Add Environment Variables**

```bash
# Add Supabase URL
vercel env add VITE_SUPABASE_URL production

# Add Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy with new env vars
vercel --prod
```

---

## 🔐 Environment Variables

### **Required Variables**

These are **mandatory** for the app to function:

```env
VITE_SUPABASE_URL=https://pgfkbcnzqozzkohwbgbk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **Optional Variables**

Enhance functionality with these optional keys:

```env
# Google Gemini AI (for AI predictions)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# TradingView Premium (for advanced charts)
VITE_TRADINGVIEW_API_KEY=your_tradingview_api_key_here
```

### **Where to Get Keys**

| Service | Dashboard URL | Notes |
|---------|--------------|-------|
| **Supabase** | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/settings/api | URL + Anon Key (public-safe) |
| **Google Gemini** | https://makersuite.google.com/app/apikey | Free tier available |
| **TradingView** | https://www.tradingview.com/pricing/ | Premium required |

---

## ✅ Post-Deployment Checks

After deployment, verify everything works:

### **1. Site Loads**
- [ ] Visit your Vercel URL: `https://your-project.vercel.app`
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools (F12)

### **2. Authentication Works**
- [ ] Navigate to `/login`
- [ ] Sign in with test account
- [ ] User profile loads correctly
- [ ] Session persists on page refresh

### **3. Supabase Connection**
- [ ] Real-time price updates appear
- [ ] Scanner fetches data from API
- [ ] Database queries work (Forum, Leaderboard)

### **4. Navigation**
- [ ] All pages load (Dashboard, Scanner, Forum, etc.)
- [ ] Routing works correctly (no 404 errors)
- [ ] CompactSidebar expands/collapses smoothly

### **5. Assets Load**
- [ ] Images display correctly
- [ ] Fonts render properly (Vietnamese characters)
- [ ] CSS animations work
- [ ] Charts render (TradingView, Lightweight Charts)

### **6. Performance**
- [ ] Lighthouse score (run in DevTools):
  - Performance: >80
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >90

---

## 🐛 Troubleshooting

### **Build Fails: "Module not found"**

**Solution:** Clear cache and reinstall dependencies

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Blank Page / White Screen**

**Cause:** Environment variables not set

**Solution:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy: `vercel --prod`

### **Supabase Connection Error**

**Symptoms:** "Failed to fetch" errors in console

**Solutions:**
1. **Check CORS settings in Supabase:**
   - Go to: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/settings/api
   - Add Vercel domain to allowed origins: `https://your-project.vercel.app`

2. **Verify RLS policies:**
   - Ensure Row Level Security allows public read access where needed
   - Check policies at: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/auth/policies

### **Duplicate Key Warning in TradingChart.jsx**

**Non-critical warning during build:**
```
Duplicate key "handleScroll" in object literal
```

**Solution:** This is a code quality issue. To fix:
1. Open `frontend/src/pages/Dashboard/Scanner/v2/components/TradingChart.jsx`
2. Find line 595: `handleScroll: {`
3. Remove duplicate key (keep only one `handleScroll` definition)

### **Large Chunk Size Warning**

**Warning during build:**
```
Some chunks are larger than 500 kB after minification
```

**This is EXPECTED** for Gemral due to:
- Lightweight Charts library (large)
- Recharts library (large)
- Many UI components

**To optimize further (optional):**
1. Enable lazy loading for heavy pages
2. Use dynamic imports: `const HeavyComponent = lazy(() => import('./Heavy'))`

### **404 on Page Refresh (Non-Root Routes)**

**Cause:** Vercel not configured for SPA routing

**Solution:** Already configured in `vercel.json`:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

If still occurring, verify `vercel.json` exists at project root.

### **Fonts Not Loading (Vietnamese Characters)**

**Solution:** Check that `vietnamese-fonts.css` is loaded before other styles:

```javascript
// frontend/src/main.jsx
import './styles/vietnamese-fonts.css' // MUST be first
import './index.css'
// ... other imports
```

---

## 🔄 Maintenance

### **Update Production**

**Automatic (GitHub Integration):**
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Vercel automatically deploys on every push to `main` branch.

**Manual (CLI):**
```bash
vercel --prod
```

### **Rollback to Previous Version**

1. Go to Vercel Dashboard → Deployments
2. Find the working version
3. Click **"•••"** → **"Promote to Production"**

### **View Deployment Logs**

1. Go to Vercel Dashboard → Your Project
2. Click on a deployment
3. View **"Build Logs"** and **"Function Logs"**

### **Monitor Performance**

**Vercel Analytics (Recommended):**
1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Vercel Analytics (free tier available)
3. View real-time performance metrics

**Custom Monitoring:**
- Use Supabase Edge Functions logs: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/logs/edge-functions
- Monitor database performance: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/database/query-performance

### **Update Dependencies**

```bash
cd frontend

# Check for outdated packages
npm outdated

# Update minor versions (safe)
npm update

# Update major versions (test first!)
npm install package-name@latest

# Test locally before deploying
npm run build && npm run preview
```

---

## 📊 Production Build Stats

**Latest Build (Successful):**
```
✓ Built in 8.01s

📦 Bundle Size:
- HTML:           1.63 KB
- CSS:          747.38 KB (gzipped: 113.31 KB)
- JavaScript: 3,115.75 KB (gzipped: 826.50 KB)

📦 Code Splitting (Manual Chunks):
- react-vendor:      46.40 KB (gzipped: 16.61 KB)
- supabase-vendor:  168.92 KB (gzipped: 44.71 KB)
- ui-vendor:        233.23 KB (gzipped: 67.56 KB)
- chart-vendor:     474.80 KB (gzipped: 145.49 KB)
- utils-vendor:     591.15 KB (gzipped: 175.59 KB)
- Main bundle:    1,362.87 KB (gzipped: 353.96 KB)
```

---

## 📚 Additional Resources

### **Official Documentation**
- [Vercel Deployment](https://vercel.com/docs)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### **Gemral Specific**
- **Project Repository:** https://github.com/jennie369/crypto-pattern-scanner
- **Supabase Dashboard:** https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk
- **Environment Template:** `frontend/.env.production.template`

### **Support**
For deployment issues, check:
1. Vercel build logs
2. Browser console (F12)
3. Supabase Edge Function logs
4. GitHub Issues: https://github.com/jennie369/crypto-pattern-scanner/issues

---

## 🎉 Success Checklist

Your deployment is successful when:

- [x] **Build completes** without errors (green checkmark in Vercel)
- [x] **Site loads** at your Vercel URL
- [x] **Authentication works** (login/signup/logout)
- [x] **Supabase connects** (data loads, real-time updates work)
- [x] **All pages render** (no 404 or blank pages)
- [x] **Navigation works** (routing, sidebar, modals)
- [x] **Performance is good** (Lighthouse score >80)
- [x] **No console errors** (check browser DevTools)

---

**Last Updated:** 2025-11-20
**Build Version:** Production Ready
**Deployment Platform:** Vercel + Supabase
**Framework:** React 19.1.1 + Vite 7.1.7

---

🎊 **Congratulations!** Your Gemral is now live on Vercel!

Next steps:
1. Test all features thoroughly
2. Set up custom domain (optional): https://vercel.com/docs/concepts/projects/domains
3. Enable Vercel Analytics for monitoring
4. Share your live site with users!
