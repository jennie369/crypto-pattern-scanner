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

## Rule 13: Wrong Table Name — `from('users')` vs `from('profiles')` (Data Source Mismatch)
**Source:** Tai San Web Sync — 46 occurrences across 13 files queried wrong table

### Khi nao ap dung (When to apply)
Khi Supabase project co nhieu tables chua user data (vd: `auth.users`, `public.profiles`, `public.users` view), va codebase khong nhat quan ve table nao la source of truth.

### Trieu chung (Symptoms)
- Query tra ve `null` hoac empty object cho user da ton tai (table khong co row cho user do)
- Profile data load thanh cong tren mobile nhung fail tren web (hoac nguoc lai)
- `profile.is_admin === false` du user la admin (vi query sai table, profile = null, fallback = false)
- Signup tao profile trong table A nhung login doc tu table B → user "mat" profile
- PostgREST embedded joins (`users:sender_id(...)`) tra ve null cho related data
- Columns khong match: web query `author_id` nhung table thuc su dung `user_id`

### Nguyen nhan goc (Root cause pattern)
Supabase co 3 "user" concepts khac nhau va dev nham lan giua chung:

```
1. auth.users          — Supabase Auth internal table (email, password hash, metadata)
                          KHONG nen query truc tiep tu client code

2. public.profiles     — Application profile table (display_name, avatar, tier, gems, badges)
                          DAY LA SOURCE OF TRUTH cho app code

3. public.users        — Co the la:
                          (a) Table cu tu early development (deprecated)
                          (b) View tren auth.users (khong co app-specific columns)
                          (c) KHONG ton tai (query fail silently voi PostgREST)
```

**Hau qua cascade khi query sai table:**
```
from('users') → query fails/returns null
  → profile = null
    → profile?.is_admin = undefined → isAdmin = false
    → profile?.scanner_tier = undefined → tier = 'FREE'
    → profile?.gems = undefined → gems display "undefined"
    → profile?.display_name = undefined → shows "Anonymous"
```

**Embedded join cung bi anh huong:**
```javascript
// SAI: join voi table 'users' (khong co display_name/avatar_url)
.select(`*, users:sender_id(id, display_name, avatar_url)`)

// DUNG: join voi table 'profiles'
.select(`*, profiles:sender_id(id, display_name, avatar_url)`)
```

### Cach dieu tra (Investigation steps)
1. **Xac dinh single source of truth**: kiem tra mobile app dung table nao
   ```bash
   grep -rn "from('profiles')" gem-mobile/src/ | head -5
   grep -rn "from('users')" gem-mobile/src/ | head -5
   ```
2. **Tim tat ca violations tren web**:
   ```bash
   # Direct queries
   grep -rn "from('users')" frontend/src/ --include='*.jsx' --include='*.js' --include='*.tsx' --include='*.ts'

   # Embedded joins (PostgREST)
   grep -rn "users:\w\+_id(" frontend/src/ --include='*.jsx' --include='*.js'
   ```
3. **Kiem tra bang nao ton tai thuc su trong DB**:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('users', 'profiles');
   ```
4. **So sanh columns**: table sai co the thieu columns ma code can
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name='profiles' ORDER BY ordinal_position;
   SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;
   ```

### Bien phap phong ngua (Preventive measures)
- **Quy tac bat buoc (Memory Rule #1)**: `from('profiles')` KHONG BAO GIO `from('users')` trong app code
- **Grep guard trong CI/CD**:
  ```bash
  # Them vao pre-commit hook hoac CI pipeline
  VIOLATIONS=$(grep -rn "from('users')" frontend/src/ --include='*.jsx' --include='*.js' --include='*.tsx' --include='*.ts' | grep -v '.backup' | grep -v '// ' | grep -v ' \* ' | wc -l)
  if [ "$VIOLATIONS" -gt 0 ]; then
    echo "ERROR: Found from('users') in frontend code. Use from('profiles') instead."
    exit 1
  fi
  ```
- **ESLint custom rule** (hoac `no-restricted-syntax`):
  ```json
  {
    "no-restricted-syntax": ["error", {
      "selector": "CallExpression[callee.property.name='from'][arguments.0.value='users']",
      "message": "Use from('profiles') instead of from('users'). See Rule 13."
    }]
  }
  ```
- **Code review checklist**: bat ky PR nao touch Supabase queries phai verify table name = `profiles`
- **Document trong codebase**: them comment `// IMPORTANT: from('profiles') NOT from('users')` o dau moi service file co Supabase queries
- **Embedded joins**: khi dung PostgREST `table:fk_column(...)`, LUON verify table name la `profiles`

### Cach fix batch (khi phat hien nhieu violations)
```bash
# 1. Tim tat ca files vi pham
grep -rl "from('users')" frontend/src/ --include='*.jsx' --include='*.js' --include='*.tsx' --include='*.ts'

# 2. Fix truc tiep (can than voi embedded joins)
# Direct queries: from('users') → from('profiles')
# Embedded joins: users:sender_id( → profiles:sender_id(
#                 users:user_id( → profiles:user_id(
#                 users:host_id( → profiles:host_id(

# 3. Verify build
cd frontend && npx vite build

# 4. Verify zero violations
grep -rn "from('users')" frontend/src/ --include='*.jsx' --include='*.js' --include='*.tsx' --include='*.ts' | grep -v '.backup' | grep -v '//' | grep -v ' \* '
# Expected: 0 results
```

### Dau hieu nhan biet (Code smell indicators)
- `from('users')` bat ky dau trong frontend code (ngoai tru comments va documentation)
- `users:column_name(` trong PostgREST select strings
- Mobile code dung `from('profiles')` nhung web code dung `from('users')` — inconsistency
- Profile data load returns null cho user da ton tai — signal table mismatch
- Column name mismatch: `author_id` vs `user_id`, `name` vs `full_name` — signal different table schema
- Signup creates row in table A, login reads from table B — profile "disappears"

---

# SECTION E: DATA SOURCE INTEGRITY

---

## Rule 14: Column Name Mismatch Between Platforms (Silent Data Loss)
**Source:** Tai San Web Sync — NewsFeed.jsx used `author_id` but table has `user_id`

### Khi nao ap dung (When to apply)
Khi web va mobile code query cung 1 table nhung dung column names khac nhau. Thuong xay ra khi 2 teams (hoac 2 thoi diem) viet code doc lap.

### Trieu chung (Symptoms)
- Query khong tra ve error nhung data thinh thoang bi null/undefined
- PostgREST embedded join tra ve null cho relationship ma BIET la co data
- Mobile hien thi data dung, web hien thi empty/null cho cung user
- `select('author_id, ...')` tra ve row nhung `author_id` field la undefined (column khong ton tai)

### Nguyen nhan goc (Root cause pattern)
PostgREST/Supabase **KHONG bao loi** khi select column khong ton tai — no silently tra ve row KHONG co field do:
```javascript
// Table has column: user_id (NOT author_id)
const { data } = await supabase
  .from('posts')
  .select('id, author_id, content')  // author_id khong ton tai
// data = [{ id: 1, content: 'hello' }]  ← author_id KHONG co trong result, NO ERROR

// Embedded join cung tuong tu:
.select('*, users:author_id(display_name)')  // FK author_id khong ton tai → join fails silently
// data = [{ id: 1, content: 'hello', users: null }]  ← null, NO ERROR
```

### Cach dieu tra (Investigation steps)
1. So sanh mobile code va web code query cung 1 table — column names co khop khong?
2. Kiem tra table schema thuc te:
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name='posts' ORDER BY ordinal_position;
   ```
3. Log `Object.keys(data[0])` de xem columns thuc te tra ve — co thieu column nao khong?
4. Kiem tra FK relationships: `\d+ table_name` trong psql

### Bien phap phong ngua (Preventive measures)
- **Reference mobile code truoc khi viet web query**: mobile la source of truth cho table schema
- **Dung TypeScript**: define interface match voi table schema, compile-time check column names
- **Supabase generate types**: `supabase gen types typescript` → import va dung generated types
- **Grep audit**: khi fix 1 column name, grep toan bo codebase cho old name

### Dau hieu nhan biet (Code smell indicators)
- Web code dung `author_id` nhung mobile dung `user_id` cho cung 1 table
- Embedded join tra ve null nhung data BIET la ton tai
- `data?.column_name` vo cung nhieu (defensive coding vi data bi null thuong xuyen)
- Khong co TypeScript types cho Supabase tables

---

# SECTION F: FORUM/COMMUNITY (2026-02-19)

---

## Rule 15: Hardcoded CSS Colors Instead of Design Tokens
**Source:** Forum/Community Sync QA — 150+ hardcoded hex colors found across 12 CSS files

### Khi nao ap dung (When to apply)
Khi viet CSS cho bat ky component nao trong project co design token system. Dac biet sau khi copy code tu AI-generated sources hoac Figma inspect.

### Trieu chung (Symptoms)
- Mau sac khong nhat quan giua cac trang
- Theme switching khong ap dung cho mot so components
- Khi thay doi brand color trong tokens, mot so UI van giu mau cu

### Nguyen nhan goc (Root cause pattern)
```css
/* SAI: Hardcoded hex */
.post-card { background: #1A1B3A; color: #ffffff; }

/* DUNG: Design token voi fallback */
.post-card { background: var(--bg-card, #1A1B3A); color: var(--text-primary, #ffffff); }
```

### Bien phap phong ngua (Preventive measures)
- Luon dung `var(--token, #fallback)` format
- Stylelint rule `declaration-strict-value` de block hardcoded colors
- Post-QA grep: `grep -rn 'color:.*#[0-9a-fA-F]' src/ --include='*.css' | grep -v 'var('`

---

## Rule 16: Desktop-First Media Queries (Should Be Mobile-First)
**Source:** Forum/Community Sync QA — CSS dung `max-width` thay vi `min-width`

### Khi nao ap dung (When to apply)
Khi project quy uoc mobile-first responsive nhung developer viet `@media (max-width:)`.

### Trieu chung (Symptoms)
- Mobile layout bi vo vi base styles la desktop styles
- Nhieu override properties trong media queries

### Nguyen nhan goc (Root cause pattern)
```css
/* SAI: Desktop-first */
.sidebar { width: 300px; display: flex; }
@media (max-width: 768px) { .sidebar { width: 100%; display: none; } }

/* DUNG: Mobile-first */
.sidebar { display: none; }
@media (min-width: 768px) { .sidebar { display: flex; width: 300px; } }
```

### Bien phap phong ngua (Preventive measures)
- Quy uoc: base CSS = mobile, `@media (min-width: 768px)` = tablet, `@media (min-width: 1024px)` = desktop
- Grep audit: `grep -rn 'max-width' src/ --include='*.css'` — moi match can duoc xem xet

---

## Rule 17: Missing Tooltips on Icon-Only Buttons
**Source:** Forum/Community Sync QA — 20+ icon buttons thieu `title` attribute

### Khi nao ap dung (When to apply)
Khi render icon button khong co text label — user khong biet chuc nang neu khong co tooltip.

### Nguyen nhan goc (Root cause pattern)
```jsx
/* SAI */ <button onClick={handleDelete}><Trash2 size={16} /></button>
/* DUNG */ <button onClick={handleDelete} title="Xoa bai viet" aria-label="Xoa bai viet"><Trash2 size={16} /></button>
```

### Bien phap phong ngua (Preventive measures)
- Moi `<button>` chi chua icon PHAI co `title` va `aria-label`
- ESLint `jsx-a11y` rules
- Code review checklist: "Icon buttons co tooltip khong?"

---

## Rule 18: Missing Access Control Guards on Mutations
**Source:** Forum/Community Sync QA — Edit/delete buttons hien thi cho tat ca users

### Khi nao ap dung (When to apply)
Khi render actions (edit, delete, pin, hide) tren user-generated content.

### Nguyen nhan goc (Root cause pattern)
```jsx
/* SAI: Khong kiem tra ownership */
<button onClick={() => deletePost(post.id)}>Xoa</button>

/* DUNG: Kiem tra ownership + role */
{(post.user_id === currentUser?.id || currentUser?.role === 'admin') && (
  <button onClick={() => deletePost(post.id)} title="Xoa bai viet">Xoa</button>
)}
```

### Bien phap phong ngua (Preventive measures)
- Document access control matrix: guest/authenticated/owner/admin
- Shared utility: `canEdit(post, user)`, `canDelete(post, user)`
- Server-side RLS la security, client guard la UX — CA HAI phai co

---

## Rule 19: Missing Null Guards and Empty States
**Source:** Forum/Community Sync QA — Components crash khi data la null/undefined

### Khi nao ap dung (When to apply)
Khi component nhan data tu API co the la null/undefined/empty array.

### Nguyen nhan goc (Root cause pattern)
```jsx
/* SAI */ <p>{post.author.display_name}</p>  // Crash neu author = null
/* DUNG */ <p>{post.author?.display_name || 'Nguoi dung'}</p>

/* SAI */ {post.images.map(img => ...)}     // Crash neu images = null
/* DUNG */ {(post.images || []).map(img => ...)}
```

### Bien phap phong ngua (Preventive measures)
- Optional chaining `?.` cho MOI property access tren API data
- Default values: `(array || [])`, `(string || '')`, `(number || 0)`
- Moi component co 3 states: loading, error, empty
- Image onError fallback: `<img onError={(e) => e.target.src = '/default-avatar.png'} />`

---

## Rule 20: Dual-Table Split — Web and Mobile Writing to Different Tables (Invisible Feature Gap)
**Source:** Paper Trading Unification — Web trades wrote to 4 web-only tables; mobile wrote to different tables. Server cron only monitored mobile tables, so web trades never auto-closed on TP/SL/liquidation.

### Khi nao ap dung (When to apply)
Khi web va mobile frontends share backend (Supabase, Firebase, etc.) nhung duoc develop doc lap, moi platform co the tao ra tables rieng cho cung 1 feature.

### Trieu chung (Symptoms)
- Feature hoat dong tren mobile nhung KHONG hoat dong tren web (hoac nguoc lai)
- Server-side cron/background job chi process data tu 1 platform
- Trades/orders dat tren web khong xuat hien tren mobile (va nguoc lai)
- Auto-close (TP/SL/liquidation) chi fire cho 1 platform
- User thay 2 balances khac nhau giua web va mobile
- Admin dashboard chi thay data tu 1 platform

### Nguyen nhan goc (Root cause pattern)
2 teams (hoac 2 thoi diem dev) tao tables khac nhau cho cung 1 feature:

```
WEB:    paper_trading_accounts    paper_trading_holdings    paper_trading_orders
MOBILE: user_paper_trade_settings paper_trades              paper_pending_orders

SERVER CRON: SELECT * FROM paper_trades WHERE status='OPEN'  ← CHI THAY MOBILE!
             Khong biet paper_trading_holdings ton tai         ← WEB INVISIBLE
```

**Hau qua cascade:**
```
Web user dat TP/SL → Luu vao paper_trading_stop_orders
  → Cron khong doc paper_trading_stop_orders
    → TP/SL KHONG BAO GIO trigger
      → User mat tien vi khong co auto-close
```

### Cach dieu tra (Investigation steps)
1. **List tat ca tables cho feature**:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%paper%' ORDER BY tablename;
   ```
2. **Kiem tra cron/background jobs doc tu table nao**:
   ```bash
   grep -rn "from(" supabase/functions/paper-trade-monitor-cron/ --include='*.ts' --include='*.js'
   ```
3. **So sanh web va mobile service files**:
   ```bash
   grep -rn "from(" frontend/src/services/paperTrading.js | sort
   grep -rn "from(" gem-mobile/src/services/paperTradeService.js | sort
   ```
4. **Kiem tra cross-platform visibility**: tao record tren web, xem mobile co thay khong

### Bien phap phong ngua (Preventive measures)
- **Single Source of Truth (SSOT)**: moi feature chi co 1 set tables. Document ro trong schema:
  ```sql
  COMMENT ON TABLE paper_trades IS 'SSOT for all paper trades (web + mobile). Do NOT create parallel tables.';
  ```
- **Return adaptors**: khi table schema khong match UI expectations, dung adaptor functions:
  ```javascript
  // Mobile table: entry_price, margin, direction='LONG'
  // Web UI expects: avg_buy_price, total_cost, side='buy'
  function adaptTradeToHolding(trade) {
    return { ...trade, avg_buy_price: trade.entry_price, total_cost: trade.margin };
  }
  ```
- **Grep guard cho deprecated tables**:
  ```bash
  VIOLATIONS=$(grep -rn "paper_trading_accounts\|paper_trading_holdings\|paper_trading_orders\|paper_trading_stop_orders" frontend/src/ --include='*.js' --include='*.jsx' | grep -v '//' | grep -v '\*' | wc -l)
  if [ "$VIOLATIONS" -gt 0 ]; then
    echo "ERROR: Deprecated paper trading tables found. Use paper_trades/user_paper_trade_settings/paper_pending_orders."
    exit 1
  fi
  ```
- **Cron/job review**: khi tao feature moi, kiem tra server-side jobs co cover tat ca tables khong
- **Cross-platform test**: sau moi feature, test: tao data tren web → xem tren mobile (va nguoc lai)

### Atomic guards khi unifying
Khi migrate sang unified tables, dung atomic UPDATE guards de tranh race conditions:
```javascript
// DUNG: Atomic close — chi close neu van dang OPEN
const { error } = await supabase
  .from('paper_trades')
  .update({ status: 'CLOSED', exit_price, realized_pnl })
  .eq('id', trade.id)
  .eq('status', 'OPEN');   // ← Atomic guard: cron va web khong close cung luc

// SAI: Non-atomic — cron va web co the close cung 1 trade
const trade = await supabase.from('paper_trades').select('*').eq('id', tradeId).single();
if (trade.status === 'OPEN') {
  // GAP: giua SELECT va UPDATE, cron co the da close roi
  await supabase.from('paper_trades').update({ status: 'CLOSED' }).eq('id', tradeId);
}
```

### Dau hieu nhan biet (Code smell indicators)
- 2+ tables co ten tuong tu cho cung 1 feature (`paper_trading_orders` + `paper_pending_orders`)
- Web service file import tables khac voi mobile service file cho cung 1 feature
- Cron/background job chi reference 1 set tables — khong cover tat ca entry points
- Feature hoat dong "sometimes" — chi khi user dung dung platform
- Balance discrepancy giua web va mobile cho cung 1 user
- New features (auto-close, notifications) chi work cho 1 platform

---

## Grep Commands for Common Web Issues

```bash
# Rule 13: Wrong table name (from('users') should be from('profiles'))
grep -rn "from('users')" frontend/src/ --include='*.jsx' --include='*.js' --include='*.tsx' --include='*.ts' | grep -v '.backup' | grep -v '//'

# Rule 13b: Wrong embedded join table
grep -rn "users:\w\+_id(" frontend/src/ --include='*.jsx' --include='*.js'

# Rule 14: Column name mismatch (compare with DB schema)
# Run: supabase gen types typescript > frontend/src/types/database.ts

# Rule 15: Hardcoded CSS colors (should use var(--token))
grep -rn 'color:.*#[0-9a-fA-F]' frontend/src/ --include='*.css' | grep -v 'var('

# Rule 16: Desktop-first media queries (should be min-width)
grep -rn 'max-width' frontend/src/ --include='*.css'

# Rule 17: Icon buttons without tooltip
grep -rn '<button' frontend/src/ --include='*.jsx' -A2 | grep -v 'title='

# Rule 18: Missing access control on mutations
grep -rn 'deletePost\|editPost\|pinPost\|hidePost' frontend/src/ --include='*.jsx' -B3 | grep -v 'user_id\|isAdmin\|role'

# Rule 19: Missing null guards on array operations
grep -rn '\.map(' frontend/src/ --include='*.jsx' | grep -v '|| \[\]' | grep -v '?.'

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

# Rule 20: Deprecated paper trading tables (should use unified tables)
grep -rn "paper_trading_accounts\|paper_trading_holdings\|paper_trading_orders\|paper_trading_stop_orders" frontend/src/ --include='*.js' --include='*.jsx' | grep -v '//' | grep -v '\*'
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
| 13 | Database | Wrong Table Name (`users` vs `profiles`) | Silent data loss |
| 14 | Database | Column Name Mismatch Between Platforms | Silent data loss |
| 15 | UI | Hardcoded CSS Colors Instead of Design Tokens | Visual inconsistency |
| 16 | Layout | Desktop-First Media Queries | Mobile layout break |
| 17 | Accessibility | Missing Tooltips on Icon-Only Buttons | UX/a11y |
| 18 | Security | Missing Access Control Guards on Mutations | UX/security |
| 19 | UI | Missing Null Guards and Empty States | Runtime crash |
| 20 | Architecture | Dual-Table Split (Web/Mobile Different Tables) | Invisible feature gap |
