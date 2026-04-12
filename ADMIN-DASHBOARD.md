# Admin Dashboard - Comprehensive Guide

## Overview

The Admin Dashboard is a powerful control center for system administrators to monitor, manage, and analyze the entire Licensify platform. It provides real-time insights, user management, activity tracking, and detailed analytics.

## Features

### 1. **Admin Dashboard Home** (`/dashboard/admin`)

The main admin dashboard provides an at-a-glance view of the entire system:

- **System Health Status**
  - Database status
  - API status
  - Authentication status
  
- **Key Metrics**
  - Total users and active users
  - Total applications
  - Total licenses
  - Active resellers
  - Invite codes created

- **Recent Users**
  - Last 10 registered users
  - User details and status
  - Quick access to user management

- **Recent Activity Feed**
  - Real-time system events
  - User registrations
  - License creations
  - Application activities

- **Auto-refresh**
  - Automatically refreshes every 30 seconds
  - Manual refresh button available
  - Shows last refresh timestamp

### 2. **User Management** (`/dashboard/admin/users`)

Complete user management interface for administrators:

#### Features
- **View All Users**
  - Complete list of all registered users
  - User details: email, role, provider, join date, last login
  - Visual user avatars

- **Search & Filter**
  - Search by email or name
  - Filter by role (All/Admin/User)
  - Real-time filtering

- **User Statistics**
  - Total users count
  - Admin count
  - Regular users count
  - Google sign-in users count

- **User Actions**
  - **Edit Role**: Promote users to admin or demote to regular user
  - **Delete User**: Permanently delete users and all their data
    - Deletes user's applications
    - Deletes user's licenses
    - Deletes user's resellers
    - Removes from Firebase Authentication
    - Cannot delete admin users
    - Cannot self-delete

#### API Endpoints
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/update-role` - Update user role
- `POST /api/admin/users/delete` - Delete user and all data

### 3. **Activity Monitor** (`/dashboard/admin/activity`)

Real-time system activity monitoring:

#### Features
- **Live Activity Feed**
  - Real-time system events
  - Auto-refresh every 10 seconds
  - Manual refresh option

- **Activity Types**
  - **User Events**: Registrations, logins
  - **License Events**: Creation, verification
  - **Application Events**: New apps created
  - **Reseller Events**: Reseller creation, logins
  - **Security Events**: Authentication events, verifications

- **Activity Details**
  - User email
  - Timestamp
  - IP address (when available)
  - Event details in JSON format

- **Filtering**
  - Filter by activity type
  - All types view
  - Category-specific views

- **Activity Statistics**
  - Total activity count
  - Breakdown by type
  - Visual categorization

#### API Endpoints
- `GET /api/admin/activity` - Get recent system activity

### 4. **Analytics & Insights** (`/dashboard/admin/analytics`)

Comprehensive analytics and business intelligence:

#### Overview Metrics
- Total users and active users
- Total applications
- Total licenses (with active/expired breakdown)
- Total resellers

#### Growth Metrics
- **User Growth**
  - Users today
  - Users this week
  - Users this month

- **License Growth**
  - Licenses today
  - Licenses this week
  - Licenses this month

#### Subscription Distribution
- Free plan users (count and percentage)
- Pro plan users (count and percentage)
- Visual progress bars

#### Authentication Providers
- Email/Password signups
- Google signups
- Distribution percentages
- Visual progress bars

#### Top Applications
- Top 10 applications by license count
- License count per application
- User count per application
- Ranked leaderboard

#### Top Resellers
- Top 10 resellers by sales
- Total sales per reseller
- Ranked leaderboard

#### License Health
- Active licenses
- Expired licenses
- Total licenses
- Health percentages

#### API Endpoints
- `GET /api/admin/analytics` - Get comprehensive analytics data

### 5. **Invite Codes Management** (`/dashboard/invite-codes`)

Manage invite codes for controlled user registration:

- Create new invite codes
- View all codes with usage statistics
- Activate/deactivate codes
- Track usage and redemptions
- Admin-only access

## Access Control

### Admin Role
Only users with `role: 'admin'` in their Firestore user document can access admin features.

### How to Make a User Admin

1. **Via Firebase Console**:
   ```
   1. Go to Firebase Console
   2. Navigate to Firestore Database
   3. Find the user in the 'users' collection
   4. Edit the document
   5. Add or update: role: 'admin'
   ```

2. **Via Admin Dashboard** (if you're already an admin):
   ```
   1. Go to /dashboard/admin/users
   2. Find the user
   3. Click "Edit Role"
   4. Select "Admin"
   ```

### Security Features

- **API Level Protection**: All admin API endpoints verify admin role
- **UI Level Protection**: Admin pages check role and show "Access Denied" for non-admins
- **Navigation Protection**: Admin links only visible to admin users
- **Firestore Rules**: Database rules enforce admin access at the data layer

## Navigation

Admin features are accessible from the main dashboard navigation:

```
Dashboard
├── Applications
├── Licenses
├── Resellers
├── Reseller Portal
└── Admin Section (Admin Only)
    ├── Admin Dashboard    (Overview & Stats)
    ├── Invite Codes       (User Registration Control)
    └── Sub-pages
        ├── /admin/users      (User Management)
        ├── /admin/activity   (Activity Monitor)
        └── /admin/analytics  (Analytics & Insights)
```

## Data Sources

### Real-time Data
- All statistics are calculated in real-time from Firestore
- No caching (uses `dynamic = 'force-dynamic'`)
- Accurate up-to-the-second data

### Collections Used
- `users` - User accounts and profiles
- `applications` - All applications created
- `licenses` - All license keys
- `resellers` - Reseller accounts
- `inviteCodes` - Invite codes for registration

## Performance Considerations

### Optimizations
- Parallel data fetching using `Promise.all()`
- Client-side filtering and sorting where possible
- Efficient Firestore queries
- Auto-refresh with configurable intervals

### Scalability
- Activity feed limited to 100 most recent events
- Top lists limited to 10 items
- Pagination ready (can be added if needed)

## UI/UX Features

### Modern Design
- Gradient cards for key metrics
- Color-coded activity types
- Progress bars for distributions
- Responsive layout (mobile-friendly)
- Dark mode ready

### Interactive Elements
- Hover effects on tables
- Modal dialogs for actions
- Real-time search and filtering
- Manual refresh buttons
- Auto-refresh indicators

### Visual Feedback
- Loading states
- Toast notifications for actions
- Success/error messages
- Access denied screens
- Empty states

## Quick Actions

From the main admin dashboard:

1. **Manage Users** → `/dashboard/admin/users`
2. **View Activity** → `/dashboard/admin/activity`
3. **Analytics** → `/dashboard/admin/analytics`

## Typical Admin Workflows

### 1. Daily Monitoring
```
1. Open Admin Dashboard (/dashboard/admin)
2. Check system health status
3. Review recent users and activity
4. Check for any unusual patterns
```

### 2. User Management
```
1. Go to User Management (/dashboard/admin/users)
2. Search for specific user
3. Edit role or delete user as needed
4. Monitor user statistics
```

### 3. System Analysis
```
1. Open Analytics (/dashboard/admin/analytics)
2. Review growth metrics
3. Check subscription distribution
4. Analyze top applications and resellers
5. Monitor license health
```

### 4. Security Monitoring
```
1. Open Activity Monitor (/dashboard/admin/activity)
2. Filter by "Security Events"
3. Review recent logins and verifications
4. Check for suspicious activity
```

## API Authentication

All admin APIs require authentication:

```typescript
headers: {
  'Authorization': `Bearer ${firebaseIdToken}`
}
```

The backend verifies:
1. Token is valid
2. User exists in Firestore
3. User has `role: 'admin'`

## Error Handling

### Access Denied
- Shows friendly error screen
- Provides return to dashboard link
- Logs unauthorized access attempts

### Data Loading Errors
- Toast notifications for errors
- Retry mechanisms
- Graceful fallbacks

## Future Enhancements

Potential additions:

1. **Charts & Graphs**
   - Line charts for growth over time
   - Pie charts for distributions
   - Interactive visualizations

2. **Export Features**
   - Export user lists to CSV
   - Download activity logs
   - Generate reports

3. **Advanced Filtering**
   - Date range filters
   - Multiple criteria filters
   - Saved filter presets

4. **Email Notifications**
   - Alert on suspicious activity
   - Daily/weekly digest emails
   - Custom notification rules

5. **Audit Logs**
   - Track admin actions
   - Change history
   - Compliance reporting

6. **Bulk Operations**
   - Bulk user role updates
   - Bulk license operations
   - Mass email to users

7. **Custom Dashboards**
   - Customizable widget layout
   - Personalized metrics
   - Saved views

## Support & Troubleshooting

### Common Issues

**Issue**: "Access Denied" for admin
- **Solution**: Verify user has `role: 'admin'` in Firestore

**Issue**: No data showing
- **Solution**: Check Firestore rules and authentication token

**Issue**: Activity feed not updating
- **Solution**: Check auto-refresh interval and manual refresh

**Issue**: Statistics seem incorrect
- **Solution**: All stats are real-time; verify Firestore data

### Getting Help

For issues or questions:
1. Check this documentation
2. Review Firestore security rules
3. Check browser console for errors
4. Verify admin role in database

## Security Best Practices

1. **Limit Admin Accounts**: Only promote trusted users to admin
2. **Regular Audits**: Review admin actions periodically
3. **Secure Access**: Use strong passwords for admin accounts
4. **Monitor Activity**: Check activity feed regularly for anomalies
5. **Role Review**: Periodically review who has admin access

## Conclusion

The Admin Dashboard provides comprehensive tools for managing and monitoring the Licensify platform. With real-time data, powerful analytics, and intuitive user management, administrators have complete control over the system.

For additional features or customization, refer to the API documentation and codebase structure.


