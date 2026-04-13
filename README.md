# DEEPAKX999AUTH - License & Authentication System

A modern, secure license key management and authentication system built with Next.js 14 and Firebase. Similar to KeyAuth, this system provides enterprise-grade license validation for your software applications.

## Features

- 🔐 **Secure Authentication** - Firebase Auth with email/password
- 🔑 **License Key Management** - Generate, validate, and manage license keys
- 📊 **Dashboard** - Modern UI for managing licenses and viewing statistics
- 🚀 **RESTful API** - Easy-to-integrate API endpoints
- 📱 **Device Management** - Control device limits per license
- ⏰ **Expiry Management** - Time-based license expiration
- 🎨 **Modern UI** - Clean, minimal design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Styling**: Tailwind CSS
- **UI Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** > Email/Password sign-in method
3. Create a **Firestore Database** in production mode
4. Generate a **Service Account** key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-api-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (from service account JSON)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   └── license/         # License management endpoints
│   ├── dashboard/           # Protected dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── docs/               # API documentation
├── components/              # React components
├── contexts/               # React contexts (Auth)
├── lib/                    # Utility functions
├── firebase.ts         # Firebase client config
├── firebase-admin.ts   # Firebase Admin SDK
├── types.ts           # TypeScript types
└── utils.ts           # Helper functions
└── public/                 # Static files
```

## API Endpoints

### Validate License (Public)
```
POST /api/license/validate
```
Validates a license key for an application.

**Request:**
```json
{
  "key": "XXXX-XXXX-XXXX-XXXX",
  "appName": "YourApp",
  "deviceId": "unique-device-id"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "License is valid",
  "license": {
    "key": "XXXX-XXXX-XXXX-XXXX",
    "appName": "YourApp",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "maxDevices": 1,
    "currentDevices": 1
  }
}
```

### Create License (Protected)
```
POST /api/license/create
Authorization: Bearer <firebase-token>
```

### List Licenses (Protected)
```
GET /api/license/list
Authorization: Bearer <firebase-token>
```

### Delete License (Protected)
```
DELETE /api/license/delete
Authorization: Bearer <firebase-token>
```

### Toggle License (Protected)
```
POST /api/license/toggle
Authorization: Bearer <firebase-token>
```

## Usage Example

### Client Integration

```javascript
async function validateLicense(licenseKey, appName, deviceId) {
  const response = await fetch('https://deepakx-999-auth.vercel.app/api/license/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: licenseKey,
      appName: appName,
      deviceId: deviceId
    })
  });

  const result = await response.json();
  
  if (result.valid) {
    console.log('License is valid!');
    return true;
  } else {
    console.error('Invalid license:', result.message);
    return false;
  }
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Docker

## Security Considerations

- Never expose your Firebase Admin SDK credentials
- Use environment variables for all sensitive data
- Enable Firestore security rules to protect user data
- Consider rate limiting for validation endpoints
- Use HTTPS in production

## Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Licenses collection
    match /licenses/{licenseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.

