# Web Troubleshooting Tips

Generalized engineering rules extracted from real bugs found during GEM Master Web Sync and web frontend development. Applicable to ANY React/Vite/web project.

---

# SECTION A: IMPORTS & BUILD

---

## Rule 1: Design Token Import Path Depth
**Source:** GEM Master Web Sync — TarotReadingPage.jsx sai import path

### Khi nao ap dung (When to apply)
Khi import file nam ngoai project root (shared design tokens, monorepo packages, config files) tu cac file nam sau nhieu cap thu muc.

### Trieu chung (Symptoms)
- Build fail voi loi `Module not found` hoac `Cannot resolve module`
- Loi chi xay ra o MOT file trong khi cac file cung thu muc khac hoat dong binh thuong
- Dev copy-paste import tu file o cap thu muc khac (it hon hoac nhieu hon 1 cap) va khong dieu chinh `../`
- Hot reload hoat dong nhung production build fail (do Vite/Webpack resolve khac nhau)

### Nguyen nhan goc (Root cause pattern)
Developer dem sai so cap `../` khi import file nam ngoai project structure. Moi `../` di len 1 cap thu muc. Neu file o `frontend/src/pages/GemMaster/TarotReadingPage.jsx` (4 cap sau tu root), can `../../../../` de ve root — nhung developer chi dung `../../../` (3 cap).

```
project-root/
  web design-tokens/     ← target (level 0)
  frontend/              ← level 1
    src/                 ← level 2
      pages/             ← level 3
        GemMaster/       ← level 4
          TarotReadingPage.jsx  ← needs ../../../../ to reach root
          SpreadPage.jsx        ← same: ../../../../
      components/        ← level 3
        Header.jsx       ← needs ../../../ to reach root
```

### Cach dieu tra (Investigation steps)
1. Khi gap `Module not found`, dem so cap thu muc tu file hien tai den project root
2. So sanh voi so luong `../` trong import statement
3. Kiem tra cac file CUNG thu muc — ho dung bao nhieu `../`?
4. Verify bang cach `ls` tu thu muc cua file theo so cap `../` — co dung la root khong?

### Bien phap phong ngua (Preventive measures)
- **Dung path aliases** trong Vite/Webpack config: `resolve.alias: { '@tokens': path.resolve(__dirname, '../web design-tokens') }` — sau do import bang `@tokens/colors` thay vi dem `../`
- **Khi copy-paste import tu file khac**, LUON dieu chinh so cap `../` theo vi tri file hien tai
- **Viet script kiem tra**: grep tat ca import co `../` va verify path ton tai
- **Organize shared code** vao `src/shared/` hoac `src/lib/` thay vi de ngoai project root

### Dau hieu nhan biet (Code smell indicators)
- Import co 3+ cap `../../../` — cang nhieu cap cang de sai
- Cac file cung thu muc co so cap `../` khac nhau cho cung 1 target
- Import tro den file nam ngoai `src/` directory (cross-boundary import)
- Khong co path aliases trong build config

---

## Rule 2: Service Export/Import Mismatch (Silent Undefined)
**Source:** GEM Master Web Sync — service files export default object nhung consumer dung named import

### Khi nao ap dung (When to apply)
Khi import function tu service file va nhan duoc `undefined` thay vi function thuc te. Dac biet nguy hiem vi JavaScript KHONG bao loi khi destructure property khong ton tai tu module.

### Trieu chung (Symptoms)
- Runtime error: `xxx is not a function` khi goi function tu service
- `typeof importedFunction === 'undefined'` nhung khong co build error
- Feature hoat dong o file A (dung `import svc from './service'; svc.fn()`) nhung fail o file B (dung `import { fn } from './service'`)
- Khong co ESLint warning vi JavaScript cho phep destructure undefined

### Nguyen nhan goc (Root cause pattern)
JavaScript co 2 he thong export khac nhau va chung KHONG tuong thich:

```javascript
// service.js — CHI CO default export
const getReadings = async () => { ... };
const saveReading = async () => { ... };
export default { getReadings, saveReading };

// consumer.js — NAMED import (SAI!)
import { getReadings } from './service';
// getReadings === undefined (!!!)
// JavaScript tim named export 'getReadings' — khong co — tra ve undefined
// KHONG co error!

// consumer.js — DEFAULT import (DUNG)
import service from './service';
service.getReadings(); // OK
```

### Cach dieu tra (Investigation steps)
1. Khi gap `xxx is not a function`, kiem tra import statement: named `{ xxx }` hay default?
2. Mo service file: co `export const xxx` (named) hay chi co `export default { xxx }` (default)?
3. Test nhanh: `import svc from './service'; console.log(Object.keys(svc))` — xem function co trong default export khong
4. Grep toan bo project: `import {` + service filename — tim tat ca named imports tu service do

### Bien phap phong ngua (Preventive measures)
- **Export CA HAI**: moi function vua la named export vua nam trong default object:
  ```javascript
  export const getReadings = async () => { ... };
  export const saveReading = async () => { ... };
  export default { getReadings, saveReading };
  ```
- **Thong nhat quy uoc**: tat ca services chi dung named exports HOAC chi dung default — khong mix
- **ESLint rule `import/named`**: bao loi khi named import khong ton tai trong source file
- **TypeScript**: se bao loi compile-time neu named export khong ton tai

### Dau hieu nhan biet (Code smell indicators)
- Service file chi co `export default { ... }` ma khong co `export const`
- Consumer file dung `import { specificFn } from './service'` voi service chi co default export
- Function call that "used to work" but stopped — someone changed export style
- Mix of `import svc from` and `import { fn } from` cho cung 1 service trong codebase

---

## Rule 3: Unused Import Bloating Bundle
**Source:** GEM Master Web Sync — GamificationPage import StreakDisplay nhung khong render

### Khi nao ap dung (When to apply)
Khi component hoac utility duoc import nhung khong bao gio duoc su dung trong file. Dac biet quan trong trong web frontend vi unused imports lam tang bundle size.

### Trieu chung (Symptoms)
- Bundle size lon hon can thiet (kiem tra bang `vite-plugin-visualizer` hoac `webpack-bundle-analyzer`)
- Build cham hon vi phai process unused modules
- Tree-shaking khong loai bo duoc (vi import la side-effect import hoac module khong pure)
- ESLint warning `no-unused-vars` (neu da configure)

### Nguyen nhan goc (Root cause pattern)
Trong qua trinh development, developer import component de tham khao hoac thu nghiem, sau do chon cach render khac nhung quen xoa import cu:

```javascript
// Developer import StreakDisplay de xem API
import StreakDisplay from '../components/StreakDisplay';
// ... roi quyet dinh render streak data bang custom styled components
// StreakDisplay KHONG xuat hien trong JSX return
// Nhung Vite/Webpack van bundle toan bo StreakDisplay + dependencies cua no
```

### Cach dieu tra (Investigation steps)
1. Chay `eslint --rule 'no-unused-vars: error'` tren toan bo `src/`
2. Vite build se in warnings ve unused imports (neu configure)
3. Voi moi import, grep ten component/function trong phan JSX return — co xuat hien khong?
4. Dung `vite-plugin-visualizer` de xem module nao chiem nhieu space nhat trong bundle

### Bien phap phong ngua (Preventive measures)
- **ESLint rules** (bat buoc trong CI):
  ```json
  {
    "no-unused-vars": "error",
    "import/no-unused-modules": "error"
  }
  ```
  Hoac dung plugin `eslint-plugin-unused-imports` de tu dong remove
- **Pre-commit hook**: chay eslint tren staged files, block commit neu co unused import
- **IDE setting**: VSCode `editor.codeActionsOnSave` + `source.organizeImports` tu dong xoa unused imports khi save
- **Code review checklist**: "Moi import co duoc su dung trong render/logic khong?"

### Dau hieu nhan biet (Code smell indicators)
- Import o dau file nhung ten component/function khong xuat hien o bat ky dau khac trong file
- `import X from '...'` theo sau boi comment `// TODO: use this later`
- File co 10+ imports nhung chi render 2-3 components
- Import toan bo library (`import _ from 'lodash'`) thay vi import cu the (`import { debounce } from 'lodash'`)

---

# SECTION B: DATABASE & RPC

---

## Rule 4: ROW Constructor Without Field Names in PostgreSQL RPC
**Source:** GEM Master Web Sync — `get_user_level_info()` RPC fail cho new users

### Khi nao ap dung (When to apply)
Khi viet PL/pgSQL function ma su dung `ROW(...)` constructor de tao record, roi truy cap record do bang ten field (`.field_name`).

### Trieu chung (Symptoms)
- RPC tra ve error: `record variable has no field "field_name"`
- Chi xay ra voi MOT nhanh logic (thuong la NOT FOUND / default branch), cac nhanh khac hoat dong binh thuong
- Chi xay ra voi new users hoac edge cases (khong co data trong DB)
- Query chay tot trong pgAdmin nhung fail khi goi qua RPC

### Nguyen nhan goc (Root cause pattern)
`ROW(value1, value2, ...)` tao **anonymous record** — cac field chi co vi tri (positional), KHONG co ten. Khi code truy cap `.field_name`, PostgreSQL khong biet map ten nao vao vi tri nao:

```sql
-- SAI: ROW constructor khong co ten field
DECLARE v_level_data RECORD;
BEGIN
  -- Nhanh chinh: SELECT INTO — co ten field
  SELECT current_level, total_xp, xp_in_level INTO v_level_data
  FROM user_levels WHERE user_id = p_user_id;

  -- Nhanh NOT FOUND: ROW constructor — KHONG co ten field
  IF NOT FOUND THEN
    v_level_data := ROW(1, 0, 0);  -- anonymous! no field names!
  END IF;

  -- FAIL: v_level_data.current_level khong ton tai cho ROW branch
  RETURN QUERY SELECT v_level_data.current_level;
END;
```

### Cach dieu tra (Investigation steps)
1. Xac dinh function nao fail — doc error message de biet ten record variable va ten field
2. Tim tat ca cho trong function ma record variable duoc gan gia tri
3. Kiem tra: co nhanh nao dung `ROW(...)` thay vi `SELECT ... INTO`?
4. Test bang cach goi function voi input trigger nhanh NOT FOUND (vd: user_id khong ton tai)

### Bien phap phong ngua (Preventive measures)
- **KHONG BAO GIO dung `ROW(...)` cho RECORD variables** — luon dung `SELECT ... AS field_name INTO variable`:
  ```sql
  -- DUNG: SELECT INTO voi ten field
  IF NOT FOUND THEN
    SELECT 1 AS current_level, 0 AS total_xp, 0 AS xp_in_level
    INTO v_level_data;
  END IF;
  ```
- **Hoac dung composite type**: `CREATE TYPE level_info AS (current_level INT, total_xp INT, ...)` va khai bao `v_level_data level_info`
- **Test LUON voi empty data**: moi RPC function phai duoc test voi user khong co data
- **Grep check**: `grep -n 'ROW(' *.sql` — moi ROW() can duoc xem xet

### Dau hieu nhan biet (Code smell indicators)
- `ROW(...)` xuat hien trong PL/pgSQL function (dac biet trong IF/ELSE branches)
- RECORD variable duoc gan gia tri bang nhieu cach khac nhau trong cac nhanh logic
- Function co nhanh "default" hoac "not found" dung hardcoded values
- Khong co unit test cho case "no data in DB"

---

## Rule 5: RLS Policy USING(true) Leak (Data Exposure)
**Source:** GEM Master Web Sync — `user_achievements` table expose tat ca user data cho anonymous callers

### Khi nao ap dung (When to apply)
Khi Supabase/PostgreSQL table co nhieu RLS policies va mot trong so do dung `USING(true)` voi role `{public}` hoac `{anon}`.

### Trieu chung (Symptoms)
- API caller khong can dang nhap van doc duoc data cua nguoi khac
- Data leak trong browser DevTools (Network tab hien thi records cua nhieu users)
- Security audit tool (vd: `pg_policies` query) phat hien permissive policies
- "Private" features (achievements, history, preferences) visible cho anonymous users

### Nguyen nhan goc (Root cause pattern)
PostgreSQL RLS co quy tac **OR**: khi co nhieu PERMISSIVE policies cho cung 1 operation (vd: SELECT), chi can MOT policy pass la du. Policy `USING(true)` luon pass, lam vo hieu hoa tat ca policies khac:

```sql
-- Policy 1: User chi doc data cua minh (restrictive)
CREATE POLICY "users_own_data" ON user_achievements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: "Anyone can view" (PERMISSIVE — override Policy 1!)
CREATE POLICY "public_view" ON user_achievements
  FOR SELECT TO public
  USING (true);  -- NGUY HIEM: bat ky ai cung doc duoc TAT CA records

-- Ket qua: Policy 2 THANG vi PostgreSQL OR cac permissive policies
-- Anonymous user goi select * from user_achievements → thay TAT CA data
```

### Cach dieu tra (Investigation steps)
1. Chay query kiem tra:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, qual
   FROM pg_policies
   WHERE qual = 'true' AND roles::text LIKE '%public%';
   ```
2. Moi ket qua la 1 potential data leak — kiem tra table do chua data gi
3. Kiem tra xem table co nhieu policies cho cung 1 operation khong (OR trap)
4. Test bang cach goi Supabase API voi anon key (khong dang nhap) — co doc duoc data khong?

### Bien phap phong ngua (Preventive measures)
- **KHONG BAO GIO dung `USING(true)` voi role `public` hoac `anon`** cho SELECT/UPDATE/DELETE
- **Moi table chi co 2 loai policy**: user-scoped (`auth.uid() = user_id`) + service_role ALL
- **Khi can tao "public read"**: dung view hoac function thay vi RLS policy — de control chinh xac
- **Audit dinh ky**: chay query o buoc 1 sau moi migration, kiem tra 0 results
- **Migration review checklist**: bat ky `USING(true)` nao phai co comment giai thich tai sao
- **Drop va recreate** thay vi ADD policy khi fix — dam bao khong con policy cu con sot

### Dau hieu nhan biet (Code smell indicators)
- `USING(true)` trong CREATE POLICY statement (dac biet voi TO `public`)
- Table co 3+ policies cho cung 1 operation (phuc tap = de sai)
- Policy name nhu "Anyone can..." hoac "Public can..." — thuong la USING(true)
- Migration file chi ADD policy ma khong review cac policies hien co

---

# SECTION C: COMPONENTS & UI

---

## Rule 6: Double-Gated Visibility (Parent AND Component Both Control Show/Hide)
**Source:** GEM Master Web Sync — UpgradeModal invisible vi bi gate o 2 cho

### Khi nao ap dung (When to apply)
Khi component co prop rieng de control visibility (`isOpen`, `visible`, `show`) nhung parent CUNG conditionally render component do.

### Trieu chung (Symptoms)
- Component duoc mount (React DevTools thay) nhung khong hien thi gi tren man hinh
- Click button "mo modal" — khong co gi xay ra, khong co error
- Component hoat dong binh thuong khi test doc lap (Storybook, unit test) nhung fail trong app
- Bug "an" vi khong co error message — component simply khong render content

### Nguyen nhan goc (Root cause pattern)
Visibility bi control o 2 noi — ca parent va component deu phai "dong y" hien thi:

```jsx
// PARENT — gate 1: conditional render
{showModal && <UpgradeModal />}
//                              ^ THIEU isOpen prop!

// COMPONENT — gate 2: internal visibility check
function UpgradeModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (           // isOpen = undefined = falsy
        <div className="modal">
          ...content...      // KHONG BAO GIO render!
        </div>
      )}
    </AnimatePresence>
  );
}

// Ket qua: Parent mount component (gate 1 pass)
// Nhung component khong render content (gate 2 fail vi isOpen = undefined)
```

### Cach dieu tra (Investigation steps)
1. Xac nhan component duoc mount: them `console.log('mounted')` vao component hoac check React DevTools
2. Kiem tra component co visibility prop khong: doc prop types / source code cua component
3. Kiem tra parent co truyen visibility prop khong: `<Component isOpen={???} />`
4. Tim pattern `{condition && <Component />}` — component co can `isOpen` prop khong?

### Bien phap phong ngua (Preventive measures)
- **Chi gate visibility o MOT noi** — chon 1 trong 2:
  - **Pattern A (Recommended)**: Parent LUON render component, component tu control visibility qua prop:
    ```jsx
    <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    ```
  - **Pattern B**: Parent conditional render, component KHONG co visibility prop:
    ```jsx
    {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    // Component luon render content khi mounted
    ```
- **PropTypes / TypeScript**: danh dau `isOpen` la required prop — build se warn neu thieu
- **Component docs**: ghi ro "Component requires isOpen prop for visibility" trong JSDoc
- **Storybook test**: test component voi `isOpen={undefined}` — phai hien thi gi do hoac bao loi

### Dau hieu nhan biet (Code smell indicators)
- `{condition && <Component />}` voi Component co prop `isOpen`/`visible`/`show`
- Component co `AnimatePresence` + `{isOpen && ...}` nhung caller khong truyen `isOpen`
- Modal/dialog component mounted nhung invisible (0x0 trong DevTools Elements panel)
- Component prop interface co `isOpen?: boolean` (optional) — nen la required

---

## Rule 7: Touch Target Size < 44px (iOS/Mobile Accessibility)
**Source:** GEM Master Web Sync — 15 interactive elements qua nho cho mobile tap

### Khi nao ap dung (When to apply)
Khi xay dung responsive web app hoac PWA se duoc su dung tren mobile devices.

### Trieu chung (Symptoms)
- User phai tap nhieu lan moi trung button tren mobile
- Tap vao button A nhung trigger button B (vi button nho, khoang cach gan)
- User feedback: "app kho dung tren dien thoai"
- Accessibility audit fail (Lighthouse, aXe) voi warning "tap target too small"

### Nguyen nhan goc (Root cause pattern)
Developer thiet ke UI tren desktop (cursor chinh xac ~1px) nhung khong test tren mobile (ngon tay ~44px). Cac element nho (icon buttons, close/clear buttons, filter pills) co width/height duoi 44px:

```css
/* SAI: Desktop-first sizing */
.close-btn {
  width: 28px;     /* Qua nho cho ngon tay */
  height: 28px;
}

.filter-pill {
  height: 36px;    /* Duoi nguong 44px */
  padding: 4px 8px;
}

/* DUNG: Mobile-friendly sizing */
.close-btn {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Icon ben trong van nho (16-24px), nhung vung tap lon (44px) */
```

### Cach dieu tra (Investigation steps)
1. Grep cho `width:` va `height:` values duoi 44 trong button/icon styles
2. Su dung Chrome DevTools Mobile Emulation — bat "Show touch areas"
3. Chay Lighthouse Accessibility audit — se flag "Tap targets are not sized appropriately"
4. Test thu tren thiet bi that — tap vao moi button/icon/link interactive

### Bien phap phong ngua (Preventive measures)
- **Design system rule**: moi interactive element co `minWidth: 44, minHeight: 44`
- **CSS utility class**: `.tap-target { min-width: 44px; min-height: 44px; }`
- **Icon buttons**: icon nho (16-24px) nhung container lon (44px) voi padding
- **Spacing**: khoang cach giua 2 tap targets >= 8px (tranh mis-tap)
- **Lint rule** (custom ESLint/Stylelint): flag interactive elements voi width/height < 44
- **Storybook viewport testing**: xem component o 375px viewport width

### Dau hieu nhan biet (Code smell indicators)
- `width: 28px` hoac `height: 30px` tren button/icon styles
- Icon component khong co padding/wrapper tang vung tap
- `fontSize: 12px` tren button text (button qua nho)
- Hai interactive elements sat nhau (< 8px gap) trong layout

---

## Rule 8: Input Font Size < 16px Causes iOS Auto-Zoom
**Source:** GEM Master Web Sync — 4 input fields voi font-size 14px gay auto-zoom tren iOS Safari

### Khi nao ap dung (When to apply)
Khi web app co `<input>`, `<textarea>`, `<select>`, hoac bat ky editable field nao se duoc su dung tren iOS Safari.

### Trieu chung (Symptoms)
- Tap vao input field tren iPhone/iPad — trang tu dong zoom in (viewport scale tang len)
- User phai pinch-to-zoom out sau moi lan nhap lieu
- Chi xay ra tren iOS Safari (Chrome iOS cung bi vi dung WebKit engine)
- Desktop va Android hoat dong binh thuong
- Meta viewport `maximum-scale=1` co the fix nhung lam mat kha nang zoom accessibility

### Nguyen nhan goc (Root cause pattern)
iOS Safari tu dong zoom vao bat ky input field nao co `font-size < 16px`. Day la "feature" cua iOS de giup user doc text dang nhap — KHONG THE tat bang CSS:

```css
/* SAI: Design token 14px cho input */
input {
  font-size: 14px;  /* iOS Safari SE auto-zoom! */
}

/* SAI: Dung design token ma gia tri < 16px */
input {
  font-size: var(--font-size-base);  /* Neu base = 14px → auto-zoom */
}

/* DUNG: Hardcode 16px cho inputs */
input, textarea, select {
  font-size: 16px;  /* iOS Safari KHONG auto-zoom */
}
```

### Cach dieu tra (Investigation steps)
1. Grep cho `font-size` trong tat ca input/textarea/select styles
2. Trace design tokens: `fontSize.base`, `--font-size-sm`, etc. — gia tri thuc la bao nhieu?
3. Test tren iOS Safari that (hoac Safari Responsive Design Mode tren Mac)
4. Xcode Simulator cung reproduce duoc loi nay

### Bien phap phong ngua (Preventive measures)
- **Global CSS rule** (dat trong base styles):
  ```css
  input, textarea, select, [contenteditable] {
    font-size: 16px !important;  /* Prevent iOS auto-zoom */
  }
  ```
- **Design system**: tao token rieng `--input-font-size: 16px` dung rieng cho form elements
- **Code review rule**: bat ky PR nao thay doi input font-size phai verify >= 16px
- **KHONG dung `maximum-scale=1` trong meta viewport** — no disable zoom cho users khuyet tat (accessibility violation)
- **QA checklist**: test moi form tren iOS Safari truoc khi merge

### Dau hieu nhan biet (Code smell indicators)
- Input/textarea style dung `fontSize` tu design token ma khong verify gia tri >= 16
- `font-size: var(--font-size-base)` tren input (base thuong < 16px)
- `font-size: 14px` hoac `font-size: 0.875rem` (= 14px voi root 16px) tren form elements
- Meta viewport co `maximum-scale=1` hoac `user-scalable=no` (fix sai cach)

---

## Rule 9: Fixed-Position Element Centering with margin auto
**Source:** GEM Master Web Sync — TarotReadingPage bottom action bar dinh sat ben trai

### Khi nao ap dung (When to apply)
Khi can center element co `position: fixed` hoac `position: absolute` theo chieu ngang.

### Trieu chung (Symptoms)
- Element `position: fixed` dinh sat ben trai (hoac ben trai cua container)
- `margin: '0 auto'` khong co tac dung center
- Element hien thi dung tren mobile (viewport = element width) nhung sai tren desktop (viewport > element width)
- Layout chinh xac trong normal flow nhung sai khi chuyen sang fixed/absolute

### Nguyen nhan goc (Root cause pattern)
`margin: auto` chi hoat dong cho **block-level elements trong normal flow**. Khi element co `position: fixed` hoac `position: absolute`, no bi loai khoi normal flow — `margin: auto` khong con tac dung center:

```css
/* SAI: margin auto khong center fixed elements */
.bottom-bar {
  position: fixed;
  bottom: 0;
  max-width: 720px;
  margin: 0 auto;     /* KHONG hoat dong! Element van o left: 0 */
}

/* DUNG: left + transform center fixed elements */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 720px;
  width: 100%;
}

/* CUNG DUNG: left + right + margin auto (CSS trick) */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 720px;
  margin: 0 auto;     /* Hoat dong KHI co ca left:0 va right:0 */
}
```

### Cach dieu tra (Investigation steps)
1. Inspect element trong DevTools — kiem tra `position` computed value
2. Neu `position: fixed` hoac `absolute` — kiem tra co `left`/`right`/`transform` khong
3. Neu chi co `margin: auto` ma khong co `left`/`right` — day la bug
4. Resize viewport de xem element co center khi viewport > element width khong

### Bien phap phong ngua (Preventive measures)
- **Quy tac nhom**: khi viet `position: fixed`, LUON kem theo `left`/`right`/`transform` positioning
- **CSS snippet** cho centered fixed element:
  ```css
  .centered-fixed {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--max-content-width);
  }
  ```
- **Design system component**: tao `<FixedBottomBar>` component voi positioning logic built-in
- **Visual regression testing**: screenshot comparison tren nhieu viewport widths (375px, 768px, 1440px)

### Dau hieu nhan biet (Code smell indicators)
- `position: fixed` hoac `position: absolute` kem `margin: '0 auto'` hoac `margin: 'auto'` ma KHONG co `left`/`right`
- Fixed element chua duoc test tren viewport lon hon element width
- Copy-paste layout style tu normal-flow element sang fixed element

---

## Rule 10: Missing Safe Area Insets on Fixed Bottom Bars
**Source:** GEM Master Web Sync — Bottom action bar bi che boi iPhone home indicator

### Khi nao ap dung (When to apply)
Khi web app co element `position: fixed` dinh o bottom viewport va se duoc su dung tren devices co notch hoac home indicator (iPhone X+, mot so Android).

### Trieu chung (Symptoms)
- Bottom bar/button bi che mot phan boi home indicator tren iPhone X+
- User khong the tap vao phan duoi cung cua bottom bar
- Chi xay ra tren notched devices — dung tren iPhone 8 hoac Android binh thuong
- Content phia sau bi overlap voi bottom bar (thieu padding bottom tren main content)

### Nguyen nhan goc (Root cause pattern)
`position: fixed; bottom: 0` dat element sat day viewport. Tren notched iPhones, day viewport NAM PHIA SAU home indicator — element bi che:

```css
/* SAI: Khong tinh safe area */
.bottom-bar {
  position: fixed;
  bottom: 0;
  padding-bottom: 16px;
}

/* DUNG: Them safe area inset */
.bottom-bar {
  position: fixed;
  bottom: 0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

Can them `<meta name="viewport" content="viewport-fit=cover">` de `env(safe-area-inset-bottom)` hoat dong.

### Cach dieu tra (Investigation steps)
1. Kiem tra meta viewport co `viewport-fit=cover` khong — neu khong, `env(safe-area-inset-*)` luon tra ve 0
2. Grep cho `position.*fixed` + `bottom.*0` — co `safe-area-inset-bottom` khong?
3. Test tren iPhone X+ (that hoac Xcode Simulator) — co bi che khong?
4. Chrome DevTools co the simulate safe areas: Settings → Devices → chon iPhone X

### Bien phap phong ngua (Preventive measures)
- **Meta viewport**: dam bao co `viewport-fit=cover`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  ```
- **CSS utility class**:
  ```css
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .safe-bottom-with-padding {
    padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
  }
  ```
- **Design system component**: `<FixedBottomBar>` tu dong them safe area padding
- **Main content padding**: khi co fixed bottom bar, main content can `padding-bottom` = bar height + safe area de tranh overlap
- **Checklist cho moi fixed bottom element**: (1) co safe-area-inset-bottom? (2) main content co padding-bottom tuong ung?

### Dau hieu nhan biet (Code smell indicators)
- `position: fixed; bottom: 0` ma khong co `env(safe-area-inset-bottom)`
- Meta viewport thieu `viewport-fit=cover`
- Bottom bar duoc test chi tren desktop hoac Android emulator
- User complaints ve "button bi che" chi tren iPhone

---

# SECTION D: PLATFORM ADAPTATION

---

## Rule 11: AsyncStorage to localStorage Adaptation Traps
**Source:** GEM Master Web Sync — Multiple services port tu React Native co subtle bugs voi localStorage

### Khi nao ap dung (When to apply)
Khi port code tu React Native (AsyncStorage) sang Web (localStorage), hoac bat ky luc nao lam viec voi localStorage trong code duoc migrate tu async storage APIs.

### Trieu chung (Symptoms)
- Data doc tu localStorage la string thay vi object (`"[object Object]"` hoac `"{"key":"value"}"` hien thi raw)
- `await localStorage.getItem()` — code chay nhung `await` la thua (localStorage la sync)
- Loi `QuotaExceededError` khi luu data lon (conversation history, reading history)
- Data cu van ton tai sau khi "clear cache" vi khong clear dung key
- TTL/expiry logic khong hoat dong vi timestamp khong duoc luu kem data

### Nguyen nhan goc (Root cause pattern)
3 trap chinh khi migrate tu AsyncStorage sang localStorage:

**Trap 1: JSON serialization bi quen**
```javascript
// AsyncStorage (React Native) — internally handles JSON
await AsyncStorage.setItem('user', user);  // RN may stringify internally
const user = await AsyncStorage.getItem('user');

// localStorage (Web) — KHONG auto-serialize
localStorage.setItem('user', user);        // Luu "[object Object]"!
const user = localStorage.getItem('user'); // Tra ve string, khong phai object!

// DUNG:
localStorage.setItem('user', JSON.stringify(user));
const user = JSON.parse(localStorage.getItem('user'));
```

**Trap 2: Error handling khac nhau**
```javascript
// AsyncStorage co the throw (network storage, encrypted storage)
try { await AsyncStorage.getItem('key'); } catch (e) { ... }

// localStorage KHONG throw khi key khong ton tai — tra ve null
// Nhung throw khi storage day (QuotaExceededError)
const value = localStorage.getItem('nonexistent'); // null, no error
```

**Trap 3: Storage limit**
```javascript
// AsyncStorage: ~6MB (iOS) / ~6MB (Android)
// localStorage: ~5MB per domain (toan bo keys cong lai)
// Neu luu conversation history, reading history, cache... de vuot 5MB
```

### Cach dieu tra (Investigation steps)
1. Grep cho `localStorage.getItem` — co `JSON.parse` wrapper khong?
2. Grep cho `localStorage.setItem` — co `JSON.stringify` wrapper khong?
3. Grep cho `await localStorage` — khong can await (sync API), signal porting oversight
4. Kiem tra tong dung luong: `Object.keys(localStorage).reduce((t,k) => t + localStorage[k].length, 0)` trong console
5. Test voi large data: conversation history 100+ messages, reading history 50+ entries

### Bien phap phong ngua (Preventive measures)
- **Tao cache helper functions** thay vi dung localStorage truc tiep:
  ```javascript
  export function getCached(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, timestamp, ttl } = JSON.parse(raw);
      if (ttl && Date.now() - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch { return null; }
  }

  export function setCache(key, value, ttlMs = 0) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data: value,
        timestamp: Date.now(),
        ttl: ttlMs
      }));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        clearOldestCacheEntries();
        // Retry once
      }
    }
  }
  ```
- **KHONG BAO GIO dung `localStorage.setItem/getItem` truc tiep** — luon qua helper
- **Storage budget**: giu tong dung luong duoi 3MB (du room cho cac domain features khac)
- **LRU eviction**: khi gan limit, xoa entries cu nhat
- **Grep audit sau khi port**: tim tat ca `localStorage.` calls va verify

### Dau hieu nhan biet (Code smell indicators)
- `localStorage.getItem()` khong co `JSON.parse` wrapper
- `localStorage.setItem()` khong co `JSON.stringify` wrapper
- `await localStorage.getItem()` — await vo nghia, signal code duoc copy tu async source
- Khong co error handling quanh `localStorage.setItem()` (QuotaExceededError)
- Raw localStorage calls scattered across nhieu files thay vi centralized helper

---

## Rule 12: Design Token Misuse Across Platforms (Display Text vs. Input Text)
**Source:** GEM Master Web Sync — Design token `fontSize.base = 14px` dung cho input (Bug 6 root cause)

### Khi nao ap dung (When to apply)
Khi design system co shared tokens duoc dung cho CA display text va form input text. Mot so tokens phu hop cho display nhung KHONG phu hop cho input (vi platform constraints nhu iOS auto-zoom).

### Trieu chung (Symptoms)
- Design token hoat dong tot cho headings, paragraphs, labels nhung gay loi khi dung cho input
- Platform-specific bugs (iOS auto-zoom, Android keyboard overlap) chi xay ra voi form elements
- Dev dung dung token theo design system nhung van co bug
- "Lam theo design spec ma van loi" — design spec khong tinh den platform constraints

### Nguyen nhan goc (Root cause pattern)
Design tokens duoc tao tu "visual design" perspective (14px tren mobile thi dep), nhung khong tinh den **platform behavior**. Mot so platforms co rules rieng cho form elements:

```javascript
// Design tokens (shared)
const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,    // Dep cho display text
    md: 16,
    lg: 18,
  }
};

// SAI: Dung base token cho input
<input style={{ fontSize: TYPOGRAPHY.fontSize.base }} />  // 14px → iOS zoom!

// DUNG: Tao token rieng cho input
const FORM_TYPOGRAPHY = {
  inputFontSize: 16,    // >= 16px — khong trigger iOS zoom
  labelFontSize: TYPOGRAPHY.fontSize.sm,  // 12px ok — label khong phai input
};
```

### Cach dieu tra (Investigation steps)
1. List tat ca design tokens lien quan den font-size
2. Grep xem token nao duoc dung tren `<input>`, `<textarea>`, `<select>`
3. Kiem tra gia tri thuc cua token — co < 16px khong?
4. Test tren iOS Safari de verify auto-zoom behavior

### Bien phap phong ngua (Preventive measures)
- **Tach tokens cho form elements**: `--input-font-size: 16px`, `--input-line-height: 1.5`
- **Document platform constraints** trong design token file:
  ```javascript
  fontSize: {
    base: 14,  // WARNING: Do NOT use for <input>/<textarea> — causes iOS auto-zoom
    input: 16, // Use this for form elements (iOS requires >= 16px)
  }
  ```
- **Lint rule (custom)**: flag bat ky `fontSize` token duoi 16 khi dung trong form element context
- **Design review checklist**: "Form elements co dung token rieng khong?"

### Dau hieu nhan biet (Code smell indicators)
- Cung 1 fontSize token dung cho ca `<p>` va `<input>`
- Design token file khong co section/token rieng cho form elements
- Khong co comment/warning ve platform constraints ben canh tokens nho (< 16px)
- Developer dung `TYPOGRAPHY.fontSize.base` everywhere vi "consistency" ma khong biet side effects

---

# QUICK REFERENCE

---

## Grep Commands for Common Web Issues

```bash
# Rule 1: Deep relative imports (potential wrong path depth)
grep -rn '../../../../' src/ --include='*.jsx' --include='*.tsx'

# Rule 2: Named imports from default-only exports
# (manual check required — grep for services with only 'export default')
grep -rn 'export default {' src/services/

# Rule 3: Unused imports (run ESLint)
npx eslint src/ --rule 'no-unused-vars: error' --no-eslintrc

# Rule 4: ROW() in SQL (potential anonymous record bug)
grep -rn 'ROW(' supabase/migrations/ supabase/functions/

# Rule 5: RLS USING(true) policies
# Run in psql:
# SELECT tablename, policyname FROM pg_policies WHERE qual='true';

# Rule 6: Double-gated visibility
grep -rn '{.*&&.*<.*Modal' src/ --include='*.jsx' --include='*.tsx'

# Rule 7: Touch targets under 44px
grep -rn 'width: [0-3][0-9]px\|height: [0-3][0-9]px' src/ --include='*.css' --include='*.jsx'

# Rule 8: Input font-size under 16px
grep -rn 'fontSize.*1[0-5]\|font-size.*1[0-5]px' src/ --include='*.jsx' --include='*.css'

# Rule 9: Fixed + margin auto (centering bug)
grep -rn "position.*fixed" src/ --include='*.jsx' --include='*.css' -A5 | grep 'margin.*auto'

# Rule 10: Fixed bottom without safe area
grep -rn "position.*fixed" src/ --include='*.jsx' --include='*.css' -A5 | grep 'bottom.*0'

# Rule 11: Raw localStorage without JSON wrapper
grep -rn 'localStorage\.getItem' src/ --include='*.js' --include='*.jsx' | grep -v 'JSON.parse'
grep -rn 'localStorage\.setItem' src/ --include='*.js' --include='*.jsx' | grep -v 'JSON.stringify'

# Rule 12: Design token on input elements
grep -rn 'TYPOGRAPHY.fontSize' src/ --include='*.jsx' -B2 | grep -i 'input\|textarea\|select'
```

---

## Rule Index

| # | Category | Title | Severity |
|---|----------|-------|----------|
| 1 | Build | Design Token Import Path Depth | Build fail |
| 2 | Build | Service Export/Import Mismatch | Silent runtime |
| 3 | Build | Unused Import Bloating Bundle | Performance |
| 4 | Database | ROW Constructor Without Field Names | RPC crash |
| 5 | Security | RLS Policy USING(true) Leak | Data exposure |
| 6 | UI | Double-Gated Visibility | Silent visual |
| 7 | UI | Touch Target Size < 44px | Accessibility |
| 8 | UI | Input Font Size < 16px iOS Auto-Zoom | Platform bug |
| 9 | Layout | Fixed-Position Centering with margin auto | Layout bug |
| 10 | Layout | Missing Safe Area Insets on Fixed Bottom Bars | Platform bug |
| 11 | Platform | AsyncStorage to localStorage Traps | Silent data |
| 12 | Platform | Design Token Misuse Across Platforms | Platform bug |
