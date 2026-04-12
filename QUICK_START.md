# 🚀 Quick Start Guide

## What You Have Now

A complete **license key authentication system** where:

1. **You create Applications** - Each app gets a unique API key
2. **You generate License Keys** - For each application
3. **Users integrate your API** - They validate licenses in their software
4. **Everything is tracked in Firebase** - Secure and scalable

## Setup Steps (DO THIS FIRST!)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase Admin SDK (**CRITICAL!**)

You **MUST** add the Firebase Admin SDK credentials to make the API work:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **ghosthub-6e484**
3. Click **⚙️ Settings** → **Service accounts**
4. Click **"Generate new private key"** → Download JSON file
5. Open the JSON file and copy these values:

Create `.env.local` in your project root:

```env
# Firebase Client Config - ALREADY SET ✅
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCllIOKW6TOo8BW2c2MjRQ-BB0_-Iyuh8c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ghosthub-6e484.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ghosthub-6e484
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ghosthub-6e484.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=873073341969
NEXT_PUBLIC_FIREBASE_APP_ID=1:873073341969:web:c21b046af50fa2416163b0
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-QBB3K4M8R4

# Firebase Admin SDK - ADD THESE FROM YOUR JSON FILE ⚠️
FIREBASE_ADMIN_PROJECT_ID=ghosthub-6e484
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ghosthub-6e484.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the `\n` characters in the private key!

### 3. Enable Firestore

1. Go to Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Start in **production mode**
4. Choose your location
5. Click **Enable**

### 4. Add Security Rules

In Firestore, go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /applications/{appId} {
      allow read, write: if request.auth != null;
    }
    
    match /licenses/{licenseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### For You (License Seller):

1. **Register/Login** at `/register` or `/login`
2. **Create an Application** at `/dashboard/applications`
   - This gives you an API key
3. **Generate License Keys** for that application
4. **Give the license key to your customers**

### For Your Customers:

They add this code to their app:

```javascript
// Use the integration code from dashboard
const auth = new AuthAPI('YOUR_API_KEY');
const result = await auth.validateLicense('LICENSE_KEY_FROM_YOU', 'device-id');

if (result.valid) {
  // Customer can use the software
} else {
  // Block access
}
```

## API Endpoints

### Public Endpoint (Your customers use this):

**`POST /api/auth/validate`**
```json
{
  "apiKey": "sk_your_api_key",
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "hwid": "device-unique-id"
}
```

Response:
```json
{
  "valid": true,
  "message": "License is valid",
  "license": {
    "key": "XXXX-XXXX-XXXX-XXXX",
    "expiresAt": "2025-12-31...",
    "maxDevices": 1
  }
}
```

### Protected Endpoints (You use these):

- `POST /api/application/create` - Create app
- `GET /api/application/list` - List your apps
- `POST /api/license/create` - Create license
- `GET /api/license/list` - List licenses
- `DELETE /api/license/delete` - Delete license
- `POST /api/license/toggle` - Enable/disable license

## File Structure

```
├── app/
│   ├── api/
│   │   ├── application/          # App management
│   │   ├── auth/validate/        # Public license validation
│   │   └── license/              # License CRUD
│   ├── dashboard/
│   │   ├── page.tsx              # License dashboard
│   │   └── applications/         # App management
│   ├── (auth)/                   # Login/register
│   └── docs/                     # API documentation
├── lib/
│   ├── firebase.ts               # Client config
│   ├── firebase-admin.ts         # Server config
│   └── types.ts                  # TypeScript types
└── public/
    └── integration-example.js    # Customer integration code
```

## Key Features

✅ **Firebase Authentication** - Secure user auth  
✅ **Application Management** - Multiple apps per user  
✅ **License Key Generation** - UUID-based keys  
✅ **Device Tracking** - HWID/device limits  
✅ **Expiration Management** - Time-based licenses  
✅ **Enable/Disable** - Control licenses remotely  
✅ **Modern UI** - Clean, minimal interface  
✅ **Full API** - RESTful endpoints  
✅ **Integration Examples** - Ready-to-use code  

## Common Issues

### "Unauthorized" errors
- Check if `.env.local` exists and has Firebase Admin credentials
- Make sure you're logged in

### "Application not found"
- Create an application first at `/dashboard/applications`

### License validation fails
- Check API key is correct
- Ensure application is active
- Verify license hasn't expired

## Next Steps

1. ✅ Set up Firebase Admin SDK credentials
2. 🚀 Run `npm install && npm run dev`
3. 📝 Register an account
4. 🎯 Create your first application
5. 🔑 Generate license keys
6. 📤 Give keys to customers
7. 💰 Profit!

## Support

- Read full docs at `/docs`
- Check SETUP.md for detailed setup
- Download integration examples from dashboard

---

**Remember:** Never commit `.env.local` to git! Your API keys and Firebase credentials should stay secret.

