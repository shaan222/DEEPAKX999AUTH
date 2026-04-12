# Rank Progression System

## Overview

The rank progression system automatically promotes users to higher ranks based on their achievements. Users can progress through 6 tiers: Bronze → Silver → Gold → Platinum → Diamond → Master.

## Rank Progression Criteria

Users need to meet **ANY ONE** of the following criteria to progress to the next tier:

### Bronze → Silver
- **100 invites** (invite codes created), OR
- **50 clients** (licenses created), OR
- **2 subscriptions** (pro/advance tier subscriptions)

### Silver → Gold
- **250 invites**, OR
- **150 clients**, OR
- **5 subscriptions**

### Gold → Platinum
- **500 invites**, OR
- **300 clients**, OR
- **10 subscriptions**

### Platinum → Diamond
- **1000 invites**, OR
- **600 clients**, OR
- **20 subscriptions**

### Diamond → Master
- **2500 invites**, OR
- **1500 clients**, OR
- **50 subscriptions**

## How It Works

### Automatic Promotion
Rank progression is automatically checked when:
1. **Invite code is created** - Checks if user meets criteria for next rank
2. **License is created** - Checks if user meets criteria for next rank
3. **Subscription is upgraded** - Checks if user meets criteria for next rank

The promotion happens in the background (non-blocking) so it doesn't slow down the main operations.

### Sub-Tier Assignment
When a user is promoted, they are assigned a sub-tier based on which criteria they met:
- **Invite sub-tier**: If they met the invite criteria
- **Client sub-tier**: If they met the client criteria
- **Subscription sub-tier**: If they met the subscription criteria

## API Endpoints

### Check and Promote Rank
```
POST /api/user/check-rank-progression
```
Manually trigger rank progression check. Returns whether promotion occurred.

### Get Rank Progression Status
```
GET /api/user/check-rank-progression
```
Get current rank, statistics, and progress toward next rank.

## Statistics Tracking

The system tracks:
- **Invites**: Number of invite codes created by the user (`inviteCodes` collection, `createdBy` field)
- **Clients**: Number of licenses created by the user (`licenses` collection, `userId` field)
- **Subscriptions**: Current active pro/advance subscription (counts as 1 if active)

## Implementation Files

- `lib/rank-progression.ts` - Core rank progression logic
- `app/api/user/check-rank-progression/route.ts` - API endpoints
- Integrated into:
  - `app/api/invite-code/create/route.ts`
  - `app/api/license/create/route.ts`
  - `app/api/subscription/upgrade/route.ts`
  - `app/api/reseller/create-license/route.ts`

## Future Enhancements

1. **Subscription History Tracking**: Track all past subscriptions, not just current
2. **Rank Progression UI**: Display progress bars and next rank requirements
3. **Rank Rewards**: Unlock features based on rank
4. **Rank Notifications**: Notify users when they're promoted
5. **Rank Analytics**: Track rank distribution and progression rates

## Notes

- Rank promotion is automatic and happens in the background
- Users can only progress one rank at a time
- Once at Master rank, no further progression is possible
- Rank updates are logged with `rankUpdatedAt` and `rankUpdatedBy` fields

