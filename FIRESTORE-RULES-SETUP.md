# Firestore Security Rules Setup Guide

This guide explains how to deploy the Firestore security rules to your Firebase project.

## 📋 What's Included

The `firestore.rules` file includes comprehensive security rules for:

- ✅ **Users Collection** - Users can manage their own profiles, admins can manage all
- ✅ **Applications Collection** - Application owners can manage their apps
- ✅ **Licenses Collection** - License owners and app owners can manage licenses
- ✅ **Invite Codes Collection** - **Admin-only access** (create, read, update, delete)
- ✅ **Resellers Collection** - Application owners can manage their resellers
- ✅ **Security Logs** - Admin-only read access
- ✅ **Rate Limits & IP Reputation** - Backend-only (denied from client)

## 🔐 Security Features

### Admin-Only Operations
- Invite codes management
- User deletion
- All collection reads/writes for admin users

### User Permissions
- Users can only read/write their own data
- Application owners can manage their applications and related data
- Reseller owners can manage their resellers

### Role-Based Access Control
The rules check user roles using:
```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## 🚀 Deploying Rules

### Option 1: Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use existing `firestore.rules` file

4. **Deploy Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 2: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

## 🔍 Testing Rules

### Test in Firebase Console

1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground**
3. Test different scenarios:
   - User reading own profile
   - Admin creating invite code
   - Non-admin trying to create invite code (should fail)

### Test Locally

```bash
# Start emulator
firebase emulators:start --only firestore

# Test rules
firebase emulators:exec --only firestore "npm test"
```

## 📝 Making a User Admin

To make a user an admin, update their role in Firestore:

### Via Firebase Console:
1. Go to **Firestore Database**
2. Navigate to `users/{userId}`
3. Edit the document
4. Set `role` field to `"admin"`

### Via Firebase Admin SDK:
```javascript
const admin = require('firebase-admin');
await admin.firestore().collection('users').doc(userId).update({
  role: 'admin'
});
```

### Via API (if you create an admin endpoint):
```typescript
// POST /api/admin/promote-user
await adminDb.collection('users').doc(userId).update({
  role: 'admin'
});
```

## ⚠️ Important Notes

1. **First User Setup**: The first user you create will have `role: 'user'` by default. You'll need to manually update it to `'admin'` in Firebase Console.

2. **Admin Role Check**: The rules use `get()` to fetch the user document, which counts as one read operation. This is necessary for security but increases read costs slightly.

3. **Testing**: Always test rules in the Rules Playground before deploying to production.

4. **Backend Access**: The Firebase Admin SDK bypasses all security rules. Your API routes use the Admin SDK, so they can read/write anything. Make sure your API routes have proper authentication and authorization checks.

## 🛡️ Rule Breakdown

### Users Collection
- ✅ Users can read/update their own profile
- ✅ Users cannot change their own role
- ✅ Admins can read/update/delete any user

### Applications Collection
- ✅ Users can create applications (ownerId = their uid)
- ✅ Only owners can read/update/delete their applications
- ✅ Admins have full access

### Licenses Collection
- ✅ Application owners can create licenses
- ✅ License owners can read their licenses
- ✅ Admins have full access

### Invite Codes Collection
- ✅ **Admin-only** - No regular users can access
- ✅ Only admins can create, read, update, delete

### Resellers Collection
- ✅ Application owners can create resellers
- ✅ Only reseller owners can manage their resellers
- ✅ Admins have full access

## 🔧 Troubleshooting

### "Permission denied" errors:

1. **Check user authentication**: Make sure user is logged in
2. **Check user role**: Verify user has correct role in Firestore
3. **Check resource ownership**: User must own the resource (or be admin)
4. **Check rules syntax**: Use Rules Playground to validate

### Rules not deploying:

1. **Check Firebase CLI version**: `firebase --version`
2. **Check project ID**: `firebase projects:list`
3. **Check file path**: Rules file should be `firestore.rules` in project root

### Admin role not working:

1. **Verify role field**: Check `users/{userId}` document has `role: 'admin'`
2. **Check case sensitivity**: Must be exactly `'admin'` (lowercase)
3. **Clear cache**: Rules may be cached, wait a few minutes or restart

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Playground](https://console.firebase.google.com/project/_/firestore/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**⚠️ Important**: Always test your rules thoroughly before deploying to production. Incorrect rules can expose sensitive data or lock out legitimate users.

