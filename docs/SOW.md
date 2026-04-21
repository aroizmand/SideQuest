# Statement of Work — SideQuest

**Version:** 1.0 | **Date:** April 21, 2026 | **Type:** Private Project

---

## 1. Project Overview

SideQuest is a mobile-first application that connects people through spontaneous, adventure-based activities happening within the next 72 hours. It is location-anchored (Calgary pilot), identity-verified, and moderated to ensure only genuine adventures appear in the feed. The product prioritizes safety, trust, and real-world follow-through over passive social engagement.

---

## 2. Goals

| Goal | Measure |
|---|---|
| Users can discover and join real adventures near them | Quest created → participant joins → shows up |
| Trust layer prevents bad actors | Verification rate, report rate, no-show rate |
| Feed stays adventure-only | % of posts rejected by moderation |
| Retention through active use | Monthly active user rate, inactivity churn |

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Mobile | Expo + React Native (TypeScript) | Speed, ecosystem, single codebase iOS/Android |
| Backend | Supabase | Auth, Postgres, Realtime, Storage — all-in-one, generous free tier |
| Chat | Stream Chat | Best-in-class React Native SDK, free at pilot scale |
| Maps | Google Maps SDK | $200/mo free credit, reliable geocoding |
| Push Notifications | Expo Push + Supabase Edge Functions | Native, free |
| AI Moderation | OpenAI GPT-4o-mini | Cheap (~$0.15/1M tokens), fast content classification |
| ID Verification | Stripe Identity (optional badge) | $1.50/verification, no monthly fee |
| Human Review | Internal admin dashboard (simple web app) | Built in Week 3 |

---

## 4. Feature Scope — MVP (8 Weeks)

### 4.1 Authentication & Onboarding
- Phone number signup with OTP (Supabase Auth)
- Selfie capture + first name — stored, shown on profile always
- Age input (used for age-restricted quests)
- Gender identity input (used for gender-restricted quests)
- Optional: Stripe Identity verification → "Verified" badge on profile
- ToS acceptance (includes inactivity deletion policy, liability disclaimer for physical activities)

### 4.2 User Profile
- Face photo (required, moderated on upload)
- First name (required)
- Age (displayed as range: 20s, 30s, etc.)
- Member since date
- Quests completed count
- Average rating (shown after first completed quest)
- Verified badge (if ID verified)
- Report / Block controls

### 4.3 Feed & Discovery
- Map view + list view toggle
- Calgary bounding box only (hardcoded for pilot)
- Filters: category, date, distance radius (5/10/25 km), age range, gender preference
- Each card shows: title, category, date/time, neighborhood (not exact address), spots left, creator first name + photo + rating
- Full sidequests disappear from feed automatically
- Pull-to-refresh, infinite scroll

### 4.4 SideQuest Creation

**Required fields:**
- Title
- Description
- Category (see 4.8)
- Date & time (max 72 hours from now)
- Meeting location (pin on map — exact address hidden until joined)
- Max participants (2–20)
- Age restriction (optional: min age, max age)
- Gender restriction (optional: all / women only / men only / non-binary friendly)
- Cover photo (optional)

**On submit:**
- AI moderation bot classifies content (adventure score, flags if it looks like a book club / speed dating / game night / passive event)
- If flagged → held for human review
- If clean → published to feed immediately

### 4.5 Joining a SideQuest
- Tap quest → view full details (still shows neighborhood, not pin)
- Join button → confirmation screen
- On join: exact location pin revealed, Stream chat group created/joined, quest removed from user's feed
- Leave quest allowed up to 2 hours before start time
- Creator notified when someone joins or leaves

### 4.6 Chat
- Stream Chat group channel created per quest
- Auto-populated with creator + all joiners
- Creator can remove a participant (removes them from chat + opens their spot)
- Channel archived 24 hours after quest date
- Basic chat moderation via Stream's built-in filters

### 4.7 Safety & Trust

**Post-quest flow (triggered 1 hour after quest start time):**
- Push notification to all participants: "Did the quest happen?"
- If yes: prompt to rate each participant (1–5 stars, optional tags: showed up, great energy, felt safe, no-show)
- Ratings averaged into profile score

**No-show policy:**
- 2 confirmed no-shows within 60 days → 2-week join ban
- 3 → permanent ban (manual review to reinstate)

**Cancellation policy:**
- Creator cancels within 12 hours of start time → reputation flag on profile
- 3 flags → quests require human review before publishing

**Report & Block:**
- Report user or quest (categories: fake identity, inappropriate content, unsafe behavior, spam)
- Reports go to admin dashboard
- Block hides user's quests from your feed and vice versa

**Location privacy:**
- Feed shows neighborhood/area only
- Exact pin revealed only after joining

### 4.8 Categories
Hiking, Trail Running, Cycling, Watersports, Winter Sports, Climbing, Urban Exploration, Fitness & Workout, Food Adventure, Photography Walk, Travel & Day Trip, Outdoor Arts & Culture, Motorsports, Other Adventure

### 4.9 Notifications
- New quest posted matching your saved filters (daily digest, not real-time spam)
- Someone joined your quest
- Quest you joined is full / starting soon (24h + 2h reminders)
- Spot opened on a quest you left (if waitlist — Phase 2)
- Post-quest rating prompt
- Inactivity warning (30 days before 60-day deletion)

### 4.10 Moderation & Admin Dashboard
- Simple web dashboard (Next.js or plain React, hosted on Vercel)
- Queue of AI-flagged quests for human review (approve / reject with reason)
- User report queue
- Ban / warn / reinstate controls
- Basic metrics: daily active users, quests created, quests completed, rejection rate

### 4.11 Inactivity Deletion
- Supabase cron job runs weekly
- Users with no login for 60 days receive push + email warning
- Users with no login for 90 days → account soft-deleted (data anonymized, not hard deleted, for 30 days)
- Compliant with PIPEDA (Canada)

---

## 5. Out of Scope — Phase 2

These are designed and accounted for architecturally but not built in the MVP:

- Waitlist for full quests
- Creator tips / monetization
- Promoted quests
- Expand beyond Calgary
- In-app emergency SOS / live location sharing
- Group size > 20
- Recurring quests
- Quest templates
- Web app

---

## 6. 8-Week Timeline

### Week 1 — Foundation
- Supabase project setup (auth, DB schema, storage buckets, RLS policies)
- Expo project scaffold (navigation, theming, TypeScript config)
- Stream Chat account + SDK integration
- Google Maps SDK setup
- Core data models finalized

### Week 2 — Auth & Profiles
- Phone OTP flow
- Selfie capture + upload
- Profile creation (name, age, gender)
- Stripe Identity integration (optional badge flow)
- Profile view screen

### Week 3 — Quest Creation & Feed
- Quest creation form (all fields, map pin picker)
- OpenAI moderation hook on submit
- Admin review dashboard (basic, web)
- Feed screen (list + map view)
- Filter/search functionality

### Week 4 — Joining & Chat
- Join flow (reveal location, chat creation)
- Leave quest logic
- Stream Chat group screen
- Quest detail screen
- Creator: remove participant

### Week 5 — Safety & Trust
- Post-quest rating flow
- No-show tracking + ban logic
- Report & block system
- Cancellation penalty logic
- Admin dashboard: report queue + ban controls

### Week 6 — Notifications & Polish
- Expo push notifications (all triggers)
- Inactivity cron job
- Feed auto-removal when full
- App navigation polish, loading states, error handling

### Week 7 — Testing & QA
- End-to-end test flows (create → join → chat → rate)
- Edge cases: full quest, cancelled quest, banned user, flagged post
- Performance: feed load time, map rendering
- Security: RLS audit, data exposure checks
- TestFlight (iOS) + internal Android track

### Week 8 — Launch Prep
- Bug fixes from QA
- ToS & Privacy Policy (use a generator, review manually)
- App Store + Google Play submission
- Admin team onboarding
- Soft launch to a small Calgary group (friends/testers)

---

## 7. High-Level Database Schema

```
users           — id, phone, first_name, photo_url, age, gender, rating_avg,
                  verified_badge, no_show_count, created_at, last_active_at

quests          — id, creator_id, title, description, category, starts_at,
                  location_area, location_pin (revealed on join), max_participants,
                  age_min, age_max, gender_restriction, status, stream_channel_id

quest_members   — quest_id, user_id, joined_at, attended (bool), rating_given (bool)

ratings         — from_user_id, to_user_id, quest_id, score, tags[]

reports         — reporter_id, reported_user_id, quest_id, category, status

blocks          — blocker_id, blocked_id
```

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 2-month timeline is tight | Week 7–8 buffer for slippage; Phase 2 features clearly scoped out |
| AI bot over-rejects legitimate quests | Tune confidence threshold; human review catches false positives |
| Low initial user density in Calgary | Soft launch with a seeded group; creator incentives (featured placement) |
| Safety incident at a quest | Clear ToS liability language; report system; consider activity-specific waivers in Phase 2 |
| Stripe Identity adds friction | It's optional — badge is the carrot, not a gate |
| PIPEDA compliance | Data minimization by design; clear deletion policy in ToS |
