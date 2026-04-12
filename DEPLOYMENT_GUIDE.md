# Vercel Deployment Guide

## Quick Deployment (Recommended)

### Option 1: Using the deployment script

```powershell
.\deploy.ps1
```

### Option 2: Manual deployment

1. **Install Vercel CLI** (if not already installed):
```powershell
npm install -g vercel
```

2. **Login to Vercel**:
```powershell
npx vercel login
```

3. **Deploy to production**:
```powershell
npx vercel --prod
```

## Important: Environment Variables

After deployment, you **MUST** add your Firebase credentials to Vercel:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (copy from your `.env.local` file or `FIREBASE_CONFIG.txt`):

### Firebase Admin SDK Variables:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Your private key (entire value including `-----BEGIN PRIVATE KEY-----`)
- `FIREBASE_CLIENT_EMAIL` - Your service account email

### Firebase Client SDK Variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

5. After adding all variables, go to **Deployments** tab
6. Click the three dots (**...**) on your latest deployment
7. Click **Redeploy** to apply the environment variables

## Firestore Security Rules

Make sure your Firestore has the correct security rules. Go to Firebase Console:

1. Open your Firebase project
2. Go to **Firestore Database** → **Rules**
3. Paste the rules from `SETUP.md`
4. Click **Publish**

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click **Domains**
3. Add your custom domain
4. Follow the DNS configuration instructions

## Deployment Commands

### Deploy to Preview:
```powershell
npx vercel
```

### Deploy to Production:
```powershell
npx vercel --prod
```

### Check deployment status:
```powershell
npx vercel ls
```

### View logs:
```powershell
npx vercel logs
```

## Troubleshooting

### Build fails:
- Make sure all dependencies are in `package.json`
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly

### Firebase errors:
- Verify all Firebase environment variables are added
- Check Firebase API is enabled (Firestore, Authentication)
- Verify service account has correct permissions

### 404 on routes:
- Next.js automatically handles routing
- Make sure you're using the App Router structure

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)

