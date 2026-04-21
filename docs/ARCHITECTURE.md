# SideQuest — Architecture

**Version:** 1.0 | **Date:** April 21, 2026

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│                                                                          │
│   ┌──────────────────────────┐     ┌──────────────────────────┐         │
│   │   SideQuest Mobile App   │     │   Admin Dashboard (Web)  │         │
│   │   Expo + React Native    │     │   Next.js / Vercel       │         │
│   │   iOS + Android          │     │                          │         │
│   └────────────┬─────────────┘     └────────────┬─────────────┘         │
└────────────────┼──────────────────────────────── ┼─────────────────────┘
                 │ HTTPS / WSS                      │ HTTPS
┌────────────────┼──────────────────────────────── ┼─────────────────────┐
│                │      API & REALTIME LAYER        │                      │
│   ┌────────────▼──────────────────────────────── ▼─────────────┐        │
│   │                      Supabase                               │        │
│   │                                                             │        │
│   │  ┌────────────┐  ┌────────────┐  ┌───────────────────────┐ │        │
│   │  │  Auth      │  │ PostgREST  │  │  Realtime (Postgres    │ │        │
│   │  │  (OTP/JWT) │  │  REST API  │  │  Change Streams)       │ │        │
│   │  └────────────┘  └────────────┘  └───────────────────────┘ │        │
│   │                                                             │        │
│   │  ┌────────────┐  ┌────────────┐  ┌───────────────────────┐ │        │
│   │  │  Storage   │  │   Edge     │  │  pg_cron Jobs          │ │        │
│   │  │  (photos)  │  │  Functions │  │  (inactivity, remind)  │ │        │
│   │  └────────────┘  └─────┬──────┘  └───────────────────────┘ │        │
│   └───────────────────────┼─────────────────────────────────────┘        │
│                            │ calls external services                      │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────────┐
│                   EXTERNAL SERVICES LAYER                                │
│                                                                          │
│   ┌────────────▼──┐  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│   │  OpenAI       │  │  Stream    │  │  Stripe  │  │  Expo Push     │  │
│   │  GPT-4o-mini  │  │  Chat API  │  │  Identity│  │  Notifications │  │
│   │  (moderation) │  │            │  │  (badge) │  │                │  │
│   └───────────────┘  └────────────┘  └──────────┘  └────────────────┘  │
│                                                                          │
│   ┌───────────────┐                                                      │
│   │  Google Maps  │                                                      │
│   │  Platform API │                                                      │
│   └───────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mobile App — Screen & Navigation Architecture

```
App
├── (auth)                          ← unauthenticated stack
│   ├── welcome.tsx
│   ├── phone-entry.tsx
│   ├── otp-verify.tsx
│   └── onboarding/
│       ├── selfie.tsx
│       ├── profile-setup.tsx
│       └── tos-accept.tsx
│
└── (app)                           ← authenticated tab navigator
    ├── feed/
    │   ├── index.tsx               ← list view + map toggle
    │   ├── filters.tsx
    │   └── quest/[id].tsx          ← quest detail
    │
    ├── create/
    │   ├── index.tsx               ← quest form
    │   └── location-picker.tsx
    │
    ├── my-quests/
    │   ├── index.tsx               ← created + joined quests
    │   └── quest/[id]/
    │       ├── manage.tsx          ← creator view
    │       └── chat.tsx            ← Stream chat screen
    │
    └── profile/
        ├── index.tsx               ← own profile
        ├── [userId].tsx            ← other user profile
        ├── settings.tsx
        └── verify-id.tsx           ← Stripe Identity flow
```

---

## 3. Data Flow Diagrams

### 3.1 Quest Creation & Moderation Flow

```
User submits quest form
         │
         ▼
  Supabase Edge Function
  /moderate-quest
         │
         ▼
  OpenAI GPT-4o-mini
  prompt: "Is this an adventure activity?
           Title: {title}
           Description: {desc}
           Category: {category}"
         │
    ┌────┴────┐
    │         │
  PASS      FLAG
(score≥0.7) (score<0.7)
    │         │
    ▼         ▼
 Insert     Insert
 quest      quest
 status=    status=
 'active'  'pending_review'
    │         │
    ▼         ▼
Appears    Held in
in feed    admin queue
```

### 3.2 Join Quest Flow

```
User taps "Join"
         │
         ▼
  Check quest eligibility
  ├── age within quest range?
  ├── gender matches restriction?
  ├── quest not full?
  ├── user not banned?
  └── user not already a member?
         │
    ┌────┴────┐
    │         │
  PASS      FAIL
    │         │
    ▼         ▼
Insert       Show
quest_       rejection
members      reason
row
    │
    ▼
Create / join
Stream Chat channel
(channel_id = quest_id)
    │
    ▼
Reveal exact
location pin
(return from
 RLS policy)
    │
    ▼
Notify quest creator
(Expo push)
    │
    ▼
Quest disappears
from user's feed
(RLS filter:
 hide joined quests)
```

### 3.3 Post-Quest Rating Flow

```
pg_cron: 1 hour after quest starts_at
         │
         ▼
  For each quest_member row
  where attended IS NULL:
         │
         ▼
  Send Expo push notification
  "Did the quest happen?"
         │
    ┌────┴──────┐
    │           │
   YES          NO
    │           │
    ▼           ▼
Show rating   Mark quest
screen for    as cancelled
each          in DB
participant
    │
    ▼
Insert rating rows
Update user.rating_avg
Check no-show threshold
→ trigger ban if needed
```

### 3.4 Inactivity Deletion Flow

```
pg_cron: every Monday 00:00 UTC
         │
         ▼
  SELECT users WHERE
  last_active_at < NOW() - 60 days
  AND warned_at IS NULL
         │
         ▼
  Send push + email warning
  Update users.warned_at
         │
         ▼
  SELECT users WHERE
  last_active_at < NOW() - 90 days
         │
         ▼
  Anonymize PII:
  ├── first_name → "Deleted User"
  ├── photo_url → null
  ├── phone → null
  └── status → 'deleted'
  (data retained anonymized 30 days
   then hard-deleted by next cron)
```

---

## 4. Security Architecture

### Row Level Security (RLS) — Key Policies

```sql
-- Users can only see their own full profile data
-- Others see only: id, first_name, photo_url, rating_avg, verified_badge, quest_count

-- Quests: location_pin only visible if user is a member
-- Quests: status='active' only (pending_review hidden from all non-admin)

-- quest_members: only visible to members of that quest

-- ratings: readable only by the rated user and admins

-- blocks: enforced at query level — blocked users' quests filtered from feed
```

### Auth Flow

```
Phone number
    │
    ▼
Supabase sends OTP (SMS via Twilio)
    │
    ▼
User submits OTP
    │
    ▼
Supabase issues JWT (access + refresh tokens)
    │
    ▼
JWT stored in Expo SecureStore (not AsyncStorage)
    │
    ▼
All API calls include Authorization: Bearer {jwt}
    │
    ▼
RLS policies enforce data access per user_id in JWT
```

---

## 5. Admin Dashboard Architecture

```
Next.js App (Vercel)
    │
    ├── /dashboard         ← metrics overview
    ├── /moderation        ← pending_review quest queue
    │     └── approve / reject with reason
    ├── /reports           ← user reports queue
    │     └── warn / ban / dismiss
    └── /users             ← search + manage users
          └── reinstate / permanent ban

Auth: Supabase admin role (separate from user JWTs)
Data: Supabase service_role key (bypasses RLS)
Hosted: Vercel (free tier)
```

---

## 6. Stream Chat Integration

```
One channel per quest:
  channel type: "messaging"
  channel id:   quest_{quest_id}
  members:      [creator_id, ...joiner_ids]

Lifecycle:
  Created:   when first member joins
  Frozen:    24 hours after quest starts_at
             (read-only, no new messages)
  Archived:  7 days after starts_at
             (hidden from UI, retained for moderation)

Moderation:
  Stream Automod: profanity filter on
  Creator:        can remove members via Stream server-side API
  Admin:          full access via Stream Dashboard
```

---

## 7. Environment Configuration

```
Mobile (Expo)
├── EXPO_PUBLIC_SUPABASE_URL
├── EXPO_PUBLIC_SUPABASE_ANON_KEY
├── EXPO_PUBLIC_STREAM_API_KEY
├── EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
└── EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY

Supabase Edge Functions (server-side secrets)
├── OPENAI_API_KEY
├── STREAM_API_SECRET
├── STRIPE_SECRET_KEY
└── EXPO_PUSH_ACCESS_TOKEN

Admin Dashboard
├── SUPABASE_URL
├── SUPABASE_SERVICE_ROLE_KEY  ← never expose to mobile client
└── STREAM_API_SECRET
```
