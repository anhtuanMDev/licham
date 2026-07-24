# Lunar Calendar App — Architecture & Build Plan

**Context:** Public App Store / Play Store release. Data is fully local, single-device (no cloud sync in v1). Target user: elderly Vietnamese parent, so legibility and simplicity outrank feature density.

---

## 1. Scope

### v1 (MVP)
- Month grid: Dương lịch (solar) with Âm lịch (lunar) day overlay
- Day detail sheet: Âm/Dương date, Can Chi (ngày/tháng/năm), Ngày Hoàng Đạo/Hắc Đạo, Tiết khí, holidays (Tết, Trung Thu, Vu Lan, Giỗ Tổ, etc.)
- Swipe or button-based month navigation, one-tap "Today"
- Reminders: create/edit/delete, lunar-recurring or solar-recurring (giỗ, sinh nhật), backed by local notifications
- Date search/jump (enter solar or lunar date)
- Settings: language (vi/en), theme, font-size scale, notification prefs
- Fully offline after install

### v1.1
- Zodiac compatibility (tuổi xung khắc)
- "Tìm ngày tốt" — good-day finder for a purpose (cưới hỏi, khai trương, động thổ...)
- Home-screen widget
- Moon phase illustration (Skia)
- Export reminders to a file (manual backup, not cloud)

### v2+ (explicitly deferred per your answer)
- Cross-device sync/backup
- Premium tier / IAP if you decide to monetize

---

## 2. Non-Functional Targets
- Cold start ≤ ~1.5s
- Month transitions locked to 60fps, entirely off the JS thread
- Works 100% offline; network is opportunistic, never blocking
- Elder-accessible: scalable font size, large tap targets, VoiceOver/TalkBack labels on every day cell, no gesture-only navigation (always a button fallback)
- No ads — you'll want to decide the monetization model (see §14), but nothing below assumes one

---

## 3. Tech Stack Decisions & Rationale

| Concern | Choice | Why |
|---|---|---|
| Build tooling | **Bare React Native CLI, New Architecture enabled** | Reanimated v4 is **New Architecture (Fabric) only** — it will throw at runtime on the old architecture, no fallback. You need RN 0.76+, `newArchEnabled=true` in `android/gradle.properties`, and `RCT_NEW_ARCH_ENABLED=1` in the `Podfile` (both are the default on recent RN CLI init templates, but worth confirming explicitly, not assuming). Skia and MMKV both support New Architecture fine. |
| State | **legend-state** as the single store | Fine-grained observables mean a day-cell re-renders only when *its* data changes, not on every month navigation — important for a 42-cell grid re-rendering on every swipe. |
| Persistence | **MMKV** via legend-state's MMKV persist plugin | Synchronous reads/writes, no AsyncStorage overhead, good fit for settings + reminders + lunar cache. |
| Lists | **legend-list** for the infinite month pager and the reminders/agenda list | The month *grid* itself (35–42 cells) doesn't need virtualization — it's the horizontal pager between months, and any long agenda/search-result list, that benefit from recycling. |
| Animation | **Reanimated v4 + worklets** | Month swipe, day-press feedback, bottom-sheet drag, modal/toast enter-exit — all UI-thread, zero JS-thread timers. |
| Custom drawing | **Skia**, used selectively | Moon-phase illustration, and possibly a compact "good/bad day" badge system to avoid stacking many nested Views × 42 cells × icons. Keep day-cell *text* as plain RN Text — verify Vietnamese diacritics render correctly in your chosen Skia font early, it's a real risk to de-risk in week 1, not week 8. |
| Images | **@d11/react-native-fast-image** (maintained fork) | For any remote/bundled raster images (zodiac art, etc.) with caching. Prefer SVG for simple icons — scales with font-size settings without shipping multiple raster densities. |
| Date math | **date-fns** (+ `date-fns/locale/vi`) | Solar date arithmetic/formatting only. Lunar conversion is *not* in date-fns — see §9. |
| i18n | **Custom, not i18next** | Only 2 languages, no complex pluralization needed — a flat-dictionary `t(key)` helper is less overhead than pulling in i18next. Revisit if you ever add a 3rd language or need ICU plural rules. |

### Native setup checklist (bare CLI — nothing here is automatic without Expo's prebuild)
- `npm install react-native-reanimated react-native-worklets` — Worklets is a separate required package as of Reanimated v4, not bundled in.
- `babel.config.js`: plugin is now `'react-native-worklets/plugin'` (not `react-native-reanimated/plugin`), must be listed last.
- `cd ios && pod install` after any native dependency add (Reanimated, Skia, MMKV, fast-image fork).
- Confirm New Architecture is actually on: `newArchEnabled=true` in `android/gradle.properties`, `RCT_NEW_ARCH_ENABLED=1` in the `Podfile` env — check rather than assume, since a mis-set flag is the #1 cause of the "Reanimated 4 supports only the New Architecture" crash on first launch.
- `react-native-mmkv` and `@shopify/react-native-skia` both autolink normally; no extra config beyond pod install.

---

## 4. Proposed Folder Structure

```
src/
  app/                    # screens / navigation
    calendar/
    day-detail/
    reminders/
    settings/
  core/
    lunar/                # conversion engine, pure functions, unit tests
      convert.ts
      canChi.ts
      solarTerms.ts
      __tests__/
    i18n/
      en.json
      vi.json
      t.ts
  state/
    settings.ts           # settings$ observable + MMKV persist config
    calendar.ts           # calendar$ (visibleMonth, selectedDate, lunarCache)
    reminders.ts          # reminders$ + CRUD + notification scheduling
    ui.ts                 # ui$ (modal, toastQueue, apiStatus map)
  overlay/
    OverlayHost.tsx        # single mount point for all modals/sheets
    ToastHost.tsx
    overlay.ts             # showModal/closeModal/toast.show API
  net/
    apiClient.ts           # fetch wrapper: abort, dedupe, retry, timeout
    contentSync.ts         # remote holiday/good-day content refresh
  scheduling/
    midnightTicker.ts       # single recursive setTimeout, no interval
    notifications.ts        # local notification scheduling for reminders
  components/
    CalendarGrid/
    MonthPager/            # legend-list based
    DayCell/                # Skia badge + RN text
```

---

## 5. State Architecture (legend-state + MMKV)

Four observable domains, each persisted or not as noted:

```ts
// state/settings.ts  — persisted
settings$: {
  locale: 'vi' | 'en',
  theme: 'light' | 'dark' | 'high-contrast',
  fontScale: number,
  notificationsEnabled: boolean,
}

// state/calendar.ts — mostly ephemeral, lunarCache persisted
calendar$: {
  visibleMonth: { year: number; month: number },
  selectedDate: string,               // ISO
  lunarCache: Record<string, LunarDay> // persisted, LRU-bounded
}

// state/reminders.ts — persisted
reminders$: Reminder[]                 // { id, title, calendarType: 'solar'|'lunar', date, repeatYearly, notifId }

// state/ui.ts — never persisted
ui$: {
  modal: { id: string; type: ModalType; props: any } | null,
  toastQueue: Toast[],
  api: Record<string, { status: 'idle'|'pending'|'success'|'error'|'cancelled'; error?: string }>
}
```

Guidelines:
- Wrap multi-field updates in `batch()` so one logical change = one render pass, not several.
- Components subscribe via legend-state's fine-grained hooks — a `DayCell` should only re-render when *its own* date's data changes, never when `visibleMonth` changes elsewhere.
- `selectedDayLunarInfo$` is a **computed** observable derived from `selectedDate$`, memoized through the lunar cache — never recomputed on every render.

---

## 6. Modal & Toast Governance (the "avoid hell" system)

The rule that prevents modal/toast hell: **no screen owns its own modal visibility state.** Everything routes through one queue.

```ts
// overlay/overlay.ts
type ModalRequest = { type: ModalType; props?: any; priority?: 'critical' | 'normal' };

overlay.showModal(req: ModalRequest): void   // sets ui$.modal, or queues if one is open
overlay.closeModal(): void                    // pops queue if anything is waiting
toast.show(message: string, opts?: { type?: 'info'|'error'|'success'; duration?: number }): void
toast.dismiss(): void
```

- `<OverlayHost />` and `<ToastHost />` mount **once**, at the app root. Screens never render their own `<Modal>` — they call `overlay.showModal(...)`.
- Only one modal visible at a time. A `critical` request (e.g. a permission prompt) can interrupt a `normal` one; otherwise new requests queue behind the current one.
- Toasts: a single array, `ToastHost` renders only the head of the queue. Showing a new toast **clears the existing dismiss timeout before setting a new one** — timers never stack (this doubles as an interval-discipline win, see §8).
- De-dupe: an identical toast message requested again within a short window (e.g. 3s) is dropped rather than re-queued — prevents "saved!" spam from a fast double-tap.
- Convention to enforce in review: no nested `Modal`-inside-`Modal`; a bottom sheet triggering another bottom sheet always goes back through `overlay.showModal`, never mounts directly.

---

## 7. API Call Lifecycle Management

Given fully-local reminders, the realistic network surface for a *published* app is narrower than it first sounds:
- Remote content refresh (yearly holiday list / "good day" content updates without needing a store review)
- Crash reporting (e.g. Sentry)
- Optional, privacy-respecting analytics (or none — worth a deliberate choice for an elder-focused app)
- App version / force-update check (optional)
- IAP receipt validation, only if you add monetization later

Every request goes through one wrapper with a strict, observable state machine:

```ts
type ApiStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';

// net/apiClient.ts
async function request(key: string, fn: (signal: AbortSignal) => Promise<T>, opts?: {
  timeoutMs?: number;      // hard ceiling, e.g. 8000
  retries?: number;        // 0 for mutations, up to 2 for idempotent GETs only
  dedupe?: boolean;        // default true — in-flight same-key call returns the same promise
}): Promise<T>
```

Rules:
- **Dedupe by key** — if `key` is already `pending`, return the in-flight promise; never fire a duplicate.
- **AbortController per request**, tied to screen focus/unmount — navigating away cancels it, sets status to `cancelled`, and this is a normal, expected outcome, not an error to surface to the user.
- **Bounded retry, backoff, idempotent-only** — content refresh may retry; anything mutation-like never does.
- **Hard timeout per request type** so a stalled call can't hang the UI indefinitely.
- Since legend-state ships a `sync` plugin with fetch/cache/retry built in, prefer wiring content refresh through `@legendapp/state/sync` rather than hand-rolling a second fetch layer — less custom code, and it naturally avoids polling (see §8).
- UI reads `ui$.api[key].status` directly to drive loading/error states — no component keeps its own `isLoading` boolean.

---

## 8. Interval & Timeout Discipline

This is worth treating as a checklist, since leaked/duplicated timers are the most common way "minimize compute" quietly fails:

1. **Midnight rollover / "today" indicator** — never poll. Compute `msUntilNextMidnight()`, schedule *one* `setTimeout`, update `today$` on fire, reschedule recursively. Clear it on `AppState` → background; recompute (don't assume it fired) on foreground, in case the device slept through it.
2. **Toast auto-dismiss** — one timer reference in `ui$`; showing a new toast clears the old timer first. Never additive.
3. **Search debounce** — a single trailing debounce (~250–300ms), cancelled on new keystroke or unmount, not stacked timeouts.
4. **All animation** — Reanimated `withTiming`/`withSpring`/gesture-driven values only. These run as worklets on the UI thread and are not JS timers at all; never hand-roll `setInterval` for a visual effect.
5. **Remote content refresh** — event-driven: on `AppState` → active, check `lastFetchedAt$` age (e.g. >24h) before fetching. No background interval loop.
6. **Reminder notifications** — scheduled once at create/edit time with an exact OS-level trigger date; the OS fires them, the app doesn't poll. On launch, run a one-time "self-heal" pass to true-up anything missed (e.g. after a long time offline), not a recurring check.
7. **Cleanup discipline** — every timer/AbortController created (debounce, midnight scheduler, toast timer, in-flight request) is held in a ref and cleared in the matching cleanup path. Make this a PR-review checklist item.
8. **Batched state writes** — wrap multi-field `legend-state` updates in `batch()`; not a timer issue, but the same "don't do more work than needed" principle.

---

## 9. Lunar Conversion Engine

- Lunar↔solar conversion is a pure, offline algorithm (the widely-used Hồ Ngọc Đức method, VN timezone UTC+7) — it is **not** an API call, and doesn't belong in date-fns.
- Decide your supported year range up front (e.g. 1900–2100) since it determines the size of the new-moon epoch table bundled into the app.
- Because it's cheap arithmetic, memoization is mainly about avoiding redundant object churn during fast scrolling, not raw compute cost:
  - In-memory cache keyed by ISO date for the current session
  - A rolling window (current month ± ~24 months) persisted to MMKV, extended lazily as the user scrolls the month pager — don't eagerly precompute the full supported range at launch.
- Unit-test the conversion against known reference dates (Tết dates for several recent years are easy to verify against) before building UI on top of it.

---

## 10. Rendering Strategy

- **Month grid**: plain RN Views/Text, not virtualized (fixed 35–42 cells).
- **Month pager**: `legend-list`, recycling month components as the user swipes horizontally — this is where "infinite" scroll actually needs windowing.
- **Reminders/agenda list, search results**: `legend-list`.
- **Skia**: moon-phase illustration, and optionally a compact badge renderer for Hoàng Đạo/Hắc Đạo indicators if plain-View badges prove too heavy across 42 cells — treat this as a "measure first" item, not an assumption. Test Vietnamese diacritic rendering in Skia text early.
- **Reanimated v4 + worklets**: month swipe gesture, day-press scale/haptic feedback, sheet drag, overlay enter/exit transitions.

---

## 11. i18n (vi / en)

- Flat dictionaries: `en.json`, `vi.json`, keyed by screen/domain.
- `settings$.locale` drives both the `t(key)` lookup and the `date-fns/locale/vi` import for solar date formatting.
- **Design decision to make deliberately**: Can Chi, tiết khí, and lunar month/day names don't really "translate" into English — most existing apps show the Vietnamese term with an optional English gloss/tooltip in EN mode rather than attempting a literal translation. Worth deciding this early since it affects the data model for holiday/term names (store both a display string and an optional gloss key, not just an English string).

---

## 12. Store Readiness & Distribution

Since this is heading to public release:
- **Privacy disclosure** (Play Data Safety form / App Store Privacy Nutrition Label) — simple if storage stays local-only; must be updated if you add crash reporting or analytics.
- **Notification permission rationale copy** matters a lot here, since reminders are a core value prop — explain *why* before the OS prompt fires.
- **Accessibility pass**: Dynamic Type scaling tested at large sizes, VoiceOver/TalkBack labels on every day cell (e.g. "Ngày 12 tháng 8 âm lịch, Chủ nhật"), verified with a real elderly test user, not just yourself.
- **Localized store listings** (vi + en) — screenshots, description, keywords.
- **Build & release automation**: Fastlane (`fastlane match` for signing, `gym`/`supply` lanes) is the standard bare-CLI equivalent of EAS Build/Submit — or a CI service like Codemagic/Bitrise if you'd rather not run Fastlane locally.
- **OTA for JS-only fixes (optional)**: worth knowing that Microsoft retired App Center/CodePush's hosted service in March 2025 — it's no longer a plug-and-play option. If you want OTA hotfixes without a store review cycle, current bare-CLI options are: self-hosting the now-open-sourced CodePush server yourself, adopting `expo-updates` as a standalone library (it works in bare RN without migrating to Expo), or a commercial hosted alternative (e.g. Stallion, AppsOnAir). Given this app is offline-first with infrequent content changes, you may not need OTA at all for v1 — worth deciding based on how often you expect to tweak holiday/content data versus just shipping a normal store update.

---

## 13. Suggested Build Phases

1. **Phase 0 — Foundations**: RN CLI init with New Architecture confirmed on, native module install + pod install (Skia, Reanimated v4 + Worklets, MMKV), babel plugin swap, lunar engine core module + unit tests against known reference dates, i18n skeleton.
2. **Phase 1 — MVP**: month view, day detail, today/navigation, settings (lang/theme/font scale), local reminders CRUD + local notifications. Fully offline, no network code yet.
3. **Phase 2 — Discipline layer**: overlay/toast host wired in at the root, API client + content-refresh wiring per §7–8, crash reporting.
4. **Phase 3 — Store readiness**: accessibility pass, privacy policy, listings, Fastlane/CI build & submit pipeline, and — importantly — a usability round with an actual elderly tester, since that's the real product bar here, not a code review.
5. **Phase 4 — Post-launch**: widget, moon-phase Skia visual, zodiac compatibility, monetization if you decide to add it.

---

## 14. Open Decisions Worth Making Early
- **Monetization**, since ads are off the table: free passion project, one-time unlock, optional tip, or small IAP for extra themes/widget packs — each has different store/legal overhead, worth picking a direction before Phase 3.
- **Analytics**: none, or a privacy-respecting minimal option — affects your privacy disclosure either way.
- **Supported lunar year range** (§9) — pick this before building the conversion table.