# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `frontend/` directory:

```bash
npm start            # Start Expo dev server (web only without native build)
npm run android      # Build and run on Android device/emulator (expo run:android)
npm run ios          # Build and run on iOS simulator (expo run:ios, macOS only)
npm run web          # Start web dev server
npm run lint         # ESLint check
```

The project uses a **development build** (not Expo Go) — `android/` is a generated native project. After adding new native dependencies, re-run `npx expo prebuild --clean` to regenerate it.

There is no test suite yet.

## Architecture

**SideQuest** is a cross-platform mobile app (iOS/Android/Web) built with Expo 54 + Expo Router. Users create and join location-based "quests" — real-world group activities.

### Directory layout (`frontend/`)

- `app/` — Expo Router file-based routes, split into two layout groups:
  - `(auth)/` — unauthenticated stack: welcome → phone-entry → otp-verify → onboarding
  - `(app)/` — authenticated tab navigator: feed, create, my-quests, profile
- `components/` — reusable UI components; platform-specific files use `.web.tsx` suffix (e.g. `QuestFeedMap.web.tsx` stubs out the native maps component for web)
- `hooks/` — one hook per data domain (`useFeedQuests`, `useCreateQuest`, `useStreamChannel`, etc.); all Supabase queries live here
- `stores/` — Zustand stores for auth (`authStore.ts`) and onboarding state
- `lib/` — singleton clients: `supabase.ts` (uses SecureStore, not AsyncStorage), `stream.ts` (Stream Chat), `profile.ts`
- `types/database.ts` — auto-generated Supabase types; regenerate with the Supabase CLI when schema changes

### Data flow

```
Mobile → Supabase PostgREST (RLS-filtered) → PostgreSQL star schema
Mobile → Stream Chat SDK → Stream Chat service (in-quest messaging)
Quest creation → Supabase Edge Function → OpenAI GPT-4o-mini moderation → DB insert
```

Key DB views: `v_feed_quests` (public feed), `v_user_public_profile`. All tables have Row-Level Security — access control is enforced at the DB layer, not in app code.

### State management

- **Zustand** (`stores/`) for global client state (auth session, onboarding progress)
- **React hooks** (`hooks/`) for server state — no React Query; hooks call Supabase directly and manage local `useState`

### Auth flow

Phone number → OTP → Supabase session → JWT stored in Expo SecureStore → `authStore` hydrates on app launch → Expo Router redirects to `(auth)` or `(app)` based on session presence.

### Platform differences

`QuestFeedMap` uses React Native Maps (native only). The `.web.tsx` sibling is a no-op stub. Expo Router automatically picks the right file by platform.

### Environment variables

Copy `frontend/.env.example` to `frontend/.env.local`. Client-side vars use `EXPO_PUBLIC_` prefix. Server-side secrets (`OPENAI_API_KEY`, `STREAM_API_SECRET`, `STRIPE_SECRET_KEY`, `EXPO_PUSH_ACCESS_TOKEN`) live only in Supabase Edge Function environment, never in the app bundle.

### Path aliases

`@/*` resolves to `frontend/` root (configured in `tsconfig.json`). Use this for all internal imports.

## Key dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `@supabase/supabase-js` | DB, auth, storage |
| `zustand` | Client state |
| `stream-chat-react-native` | In-quest chat UI |
| `react-native-maps` | Location feed map |
| `@stripe/stripe-react-native` | ID verification payment |
| `expo-secure-store` | JWT token storage |

## Docs

- `docs/ARCHITECTURE.md` — auth flows, moderation pipeline, Stream Chat lifecycle, admin dashboard design
- `docs/DB_SCHEMA.md` — full star schema, RLS policies, pg_cron jobs, analytics views
- `docs/SOW.md` — feature scope and product decisions
