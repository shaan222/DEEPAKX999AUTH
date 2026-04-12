# ⚠️ IMPORTANT: Vercel Environment Variables Setup

Your app is deployed but **requires environment variables** to work!

## Quick Setup Steps

### 1. Go to Vercel Dashboard
Open: https://vercel.com/shaan786lls-projects/auth-api-system/settings/environment-variables

### 2. Add These Environment Variables

Copy these from your `FIREBASE_CONFIG.txt` or `.env.local` file:

#### Firebase Admin SDK (Required):
```
FIREBASE_PROJECT_ID = your-project-id
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**IMPORTANT for FIREBASE_PRIVATE_KEY:**
- Include the ENTIRE key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters as they are (don't replace with actual newlines)

#### Firebase Client SDK (Required):
```
NEXT_PUBLIC_FIREBASE_API_KEY = your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID = your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-XXXXXXXXXX
```

### 3. Select Environment

For each variable, select:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. Redeploy

After adding ALL variables:

**Option A - From Dashboard:**
1. Go to Deployments tab
2. Click the three dots (**...**) on the latest deployment
3. Click **Redeploy**

**Option B - From Command Line:**
```powershell
cd "C:\Users\MD  FAIZAN\Pictures\GRABBER exe"
npx vercel --prod --yes
```

## Your Deployment URLs

- **Production**: https://auth-api-system-163ph3a7x-shaan786lls-projects.vercel.app
- **Dashboard**: https://vercel.com/shaan786lls-projects/auth-api-system

## Troubleshooting

### "Service account object must contain project_id"
- You're missing the Firebase environment variables
- Add all variables listed above

### "Failed to compile"
- Check if all environment variables are added correctly
- Make sure `FIREBASE_PRIVATE_KEY` includes the full key with headers

### App loads but Firebase errors
- Clear browser cache
- Check Firebase Console that Firestore and Authentication are enabled
- Verify Firestore security rules are set (see SETUP.md)

## Next Steps After Deployment

1. ✅ Add environment variables (this file)
2. ✅ Redeploy
3. ✅ Test the live app
4. ✅ Add Firestore security rules (if not done)
5. ✅ Optional: Add custom domain

