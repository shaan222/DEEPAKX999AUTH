# Setup Guide for AuthAPI

This guide will walk you through setting up the AuthAPI License & Authentication System.

## Step 1: Firebase Project Setup

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "AuthAPI")
4. (Optional) Enable Google Analytics
5. Click "Create project"

### Enable Authentication

1. In your Firebase project, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Enable **Email/Password** sign-in provider
5. Click "Save"

### Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Select **Production mode** (we'll add rules later)
4. Choose your preferred location
5. Click "Enable"

### Set Up Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Licenses collection - users can only read/write their own licenses
    match /licenses/{licenseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "AuthAPI Web")
5. Copy the `firebaseConfig` object values

### Generate Service Account Key

1. In **Project settings**, go to **Service accounts** tab
2. Click "Generate new private key"
3. Click "Generate key"
4. Save the downloaded JSON file securely (you'll need it for the next step)

## Step 2: Install Dependencies

In your project directory, run:

```bash
npm install
```

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.local.example .env.local
```

2. Open `.env.local` and fill in the values:

### Client Configuration (from Firebase Web App Config)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Admin Configuration (from Service Account JSON)

Open the service account JSON file you downloaded and copy these values:

```env
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important:** The private key must keep the `\n` characters. If you're copying from the JSON file, the newlines are already escaped. The entire key should be in quotes.

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the Application

### Create an Account

1. Click "Get Started" or "Register"
2. Enter an email and password
3. Click "Create account"
4. You should be redirected to the dashboard

### Create a License

1. In the dashboard, click "+ Create New License"
2. Enter:
   - Application name (e.g., "MyApp")
   - Expiry days (e.g., 30)
   - Max devices (e.g., 1)
3. Click "Create"
4. Your license key will appear in the table

### Test License Validation

Use the API endpoint to validate your license:

```bash
curl -X POST http://localhost:3000/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "key": "YOUR-LICENSE-KEY",
    "appName": "MyApp",
    "deviceId": "test-device-123"
  }'
```

You should receive a JSON response indicating if the license is valid.

## Step 6: Deploy to Production

### Vercel (Recommended)

1. Push your code to GitHub (don't commit `.env.local`!)
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add all environment variables from `.env.local` to Vercel
6. Click "Deploy"

### Environment Variables in Vercel

Add these in Project Settings → Environment Variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Make sure you're using the Web API key, not a service account key

### "Permission denied" in Firestore
- Verify your Firestore security rules are set up correctly
- Make sure you're authenticated when accessing protected data

### "Private key is invalid"
- Ensure the private key includes `\n` characters
- The entire key should be wrapped in quotes
- Check that you copied the entire key including BEGIN and END markers

### Module not found errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then run `npm install`

## Next Steps

1. Customize the UI to match your brand
2. Add more license features (custom metadata, webhooks, etc.)
3. Set up analytics and monitoring
4. Implement rate limiting for public endpoints
5. Add email notifications for license events

## Security Checklist

- [ ] Firebase Security Rules are properly configured
- [ ] Environment variables are not committed to git
- [ ] Service account key is stored securely
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented for validation endpoint

## Support

For issues and questions:
- Check the [README.md](README.md) for API documentation
- Open an issue on GitHub
- Review Firebase Console logs for server errors

Happy coding! 🚀

