# Phase 01: Backup & Environment Setup

## Thông Tin Phase
- **Thời lượng ước tính**: 30 phút
- **Trạng thái**: Pending
- **Tiến độ**: 0%
- **Phụ thuộc**: None (first phase)

---

## Mục Tiêu

Chuẩn bị môi trường làm việc an toàn trước khi thực hiện các thay đổi UI/UX. Tạo backup và verify dependencies để đảm bảo có thể rollback nếu cần thiết.

---

## Deliverables

- [ ] Git branch `phase3-layout-refinement` đã được tạo
- [ ] Current working files được backup
- [ ] Git commit trước khi bắt đầu
- [ ] Node modules và dependencies verified
- [ ] Development server chạy ổn định

---

## Bước 1: Create Git Branch & Backup

### Mục đích
Tạo branch riêng cho Phase 3 để có thể rollback dễ dàng nếu có vấn đề. Backup đảm bảo không mất code hiện tại.

### Công việc cần làm

1. **Check git status và commit current work**
   ```bash
   cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
   git status

   # Nếu có changes chưa commit
   git add .
   git commit -m "chore: Save current state before Phase 3"
   ```

2. **Create new branch for Phase 3**
   ```bash
   git checkout -b phase3-layout-refinement
   ```

3. **Verify branch created**
   ```bash
   git branch
   # Should show: * phase3-layout-refinement
   ```

4. **Create backup commit**
   ```bash
   git add .
   git commit -m "backup: Before Phase 3 Navigation & Layout Refinement"
   ```

### Verification Checklist
- [ ] Git repository is clean (no uncommitted changes)
- [ ] New branch `phase3-layout-refinement` created
- [ ] Currently on the new branch (check with `git branch`)
- [ ] Backup commit created

---

## Bước 2: Backup Critical Files

### Mục đích
Tạo bản sao vật lý của các files quan trọng sẽ được chỉnh sửa, để có thể restore nhanh nếu cần.

### Công việc cần làm

1. **Backup TopNavBar files**
   ```bash
   cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend\src\components"

   # Create backup copies
   copy TopNavBar.jsx TopNavBar.jsx.backup
   copy TopNavBar.css TopNavBar.css.backup
   ```

2. **Backup tool pages**
   ```bash
   cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend\src\pages"

   # Backup Scanner
   copy "Dashboard\Scanner\Scanner.jsx" "Dashboard\Scanner\Scanner.jsx.backup"
   copy "Dashboard\Scanner\Scanner.css" "Dashboard\Scanner\Scanner.css.backup"

   # Backup Journal
   copy "Dashboard\TradingJournal\TradingJournal.jsx" "Dashboard\TradingJournal\TradingJournal.jsx.backup"
   copy "Dashboard\TradingJournal\TradingJournal.css" "Dashboard\TradingJournal\TradingJournal.css.backup"

   # Backup Portfolio
   copy "Dashboard\Portfolio\Portfolio.jsx" "Dashboard\Portfolio\Portfolio.jsx.backup"
   copy "Dashboard\Portfolio\Portfolio.css" "Dashboard\Portfolio\Portfolio.css.backup"
   ```

3. **List backup files**
   ```bash
   # Verify backups created
   dir /s /b *.backup
   ```

### Verification Checklist
- [ ] TopNavBar.jsx.backup exists
- [ ] TopNavBar.css.backup exists
- [ ] Scanner backup files exist
- [ ] Journal backup files exist
- [ ] Portfolio backup files exist
- [ ] All backup files have same size as originals

---

## Bước 3: Verify Environment & Dependencies

### Mục đích
Đảm bảo development environment đang hoạt động tốt và có đầy đủ dependencies cần thiết.

### Công việc cần làm

1. **Check Node.js and npm versions**
   ```bash
   node --version
   # Should be: v18.x or higher

   npm --version
   # Should be: 9.x or higher
   ```

2. **Verify package.json dependencies**
   ```bash
   cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend"

   # Check if required packages are listed
   type package.json
   ```

   **Required packages:**
   - react: ^18.x
   - react-router-dom: ^6.x
   - lucide-react: ^0.x (for icons)
   - @supabase/supabase-js: ^2.x

3. **Install/Update dependencies if needed**
   ```bash
   npm install

   # Should complete without errors
   ```

4. **Verify no security vulnerabilities**
   ```bash
   npm audit

   # Fix if there are critical vulnerabilities
   npm audit fix
   ```

### Verification Checklist
- [ ] Node.js version compatible (v18+)
- [ ] npm version compatible (v9+)
- [ ] package.json contains all required dependencies
- [ ] `npm install` completes successfully
- [ ] No critical security vulnerabilities

---

## Bước 4: Test Development Server

### Mục đích
Đảm bảo development server chạy ổn định trước khi bắt đầu chỉnh sửa code.

### Công việc cần làm

1. **Start development server**
   ```bash
   cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend"
   npm run dev
   ```

2. **Test basic navigation**
   - Open browser to `http://localhost:5173` (or displayed port)
   - Click through main navigation items
   - Verify all pages load without errors

3. **Check browser console**
   - Open DevTools (F12)
   - Navigate to Console tab
   - Verify no critical errors (warnings are okay)

4. **Test tier-locked features**
   - Try accessing TIER 1, 2, 3 features
   - Verify lock state works correctly

### Verification Checklist
- [ ] Dev server starts without errors
- [ ] Homepage loads correctly
- [ ] Navigation links work
- [ ] No critical errors in browser console
- [ ] Tier-based access control working

---

## Edge Cases & Error Handling

### Edge Cases cần xử lý

1. **Git branch already exists**
   - Hiện tượng: Error "branch already exists"
   - Giải pháp:
     ```bash
     git branch -D phase3-layout-refinement
     git checkout -b phase3-layout-refinement
     ```

2. **Backup files already exist**
   - Hiện tượng: "File already exists" error
   - Giải pháp:
     ```bash
     # Add timestamp to backup filename
     copy TopNavBar.jsx TopNavBar.jsx.backup.20251119
     ```

3. **npm install fails**
   - Hiện tượng: Dependency installation errors
   - Giải pháp:
     ```bash
     # Clear cache and reinstall
     npm cache clean --force
     del /s /q node_modules
     del package-lock.json
     npm install
     ```

4. **Dev server won't start**
   - Hiện tượng: Port already in use
   - Giải pháp:
     ```bash
     # Kill existing process
     taskkill /F /IM node.exe

     # Or use different port
     npm run dev -- --port 5174
     ```

---

## Dependencies & Prerequisites

### System Requirements
- Windows 10/11
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git installed and configured

### Required npm Packages
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "lucide-react": "^0.294.0",
  "@supabase/supabase-js": "^2.38.0"
}
```

### Environment Variables
Verify `.env` file exists with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## Completion Criteria

Phase 01 được coi là hoàn thành khi:

- [ ] Git branch `phase3-layout-refinement` created and checked out
- [ ] All critical files backed up (.backup files exist)
- [ ] Git backup commit created
- [ ] Development environment verified (Node, npm versions)
- [ ] All dependencies installed successfully
- [ ] Dev server running without errors
- [ ] No critical browser console errors
- [ ] Navigation and tier system working

---

## Notes & Best Practices

### Lưu ý khi thực hiện
- ⚠️ **NEVER delete .backup files** until Phase 3 is complete and verified
- ⚠️ Always work on the `phase3-layout-refinement` branch, not main
- ⚠️ If dev server shows errors, STOP and fix before proceeding
- ⚠️ Keep original files (.backup) until final testing passes

### Best Practices
- ✅ Commit frequently with clear messages
- ✅ Test after each major change
- ✅ Document any issues encountered
- ✅ Keep terminal/console open to monitor errors

### Common Pitfalls
- ❌ Modifying files on main branch → Always check `git branch`
- ❌ Skipping dependency verification → May cause runtime errors later
- ❌ Not backing up files → No rollback option if things break
- ❌ Ignoring console errors → Small errors can cascade

---

## Next Steps

Sau khi hoàn thành phase này:

1. Verify all checklist items are completed ✅
2. Update status in `plan.md`:
   ```markdown
   ### Phase 01: Backup & Environment Setup
   - **Trạng thái**: ✅ Completed
   - **Tiến độ**: 100%
   ```
3. Commit with message:
   ```bash
   git add .
   git commit -m "setup: Complete Phase 01 - Backup & Environment Setup"
   ```
4. Proceed to **phase-02-navigation-redesign.md**

---

**Phase 01 Status:** ⏳ Pending → Start when ready
