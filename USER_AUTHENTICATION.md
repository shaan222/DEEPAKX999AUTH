# User & Client Authentication System

## Overview

Your AuthAPI system now supports **TWO authentication methods**:

1. **License Key Validation** - Perfect for software licensing
2. **User/Client Authentication** - Username/password login for your end-users

This is just like KeyAuth! Your customers can now create user accounts in their applications.

## How It Works

### For You (System Owner):
1. Create an **Application** in your dashboard
2. Get your **API Key**
3. Share the API key with your customers/developers
4. View all users registered in your application at `/dashboard/applications/{id}/users`

### For Your End-Users (Clients):
1. They register in your application using username/password
2. They can optionally bind a license key to their account
3. They login with username/password
4. Your application validates their credentials

## API Endpoints

### 1. Register a New User
**`POST /api/user/register`** (Public)

Register a new user in your application.

**Request:**
```json
{
  "apiKey": "sk_your_api_key",
  "username": "john_doe",
  "password": "secure_password",
  "email": "john@example.com",          // Optional
  "licenseKey": "XXXX-XXXX-XXXX-XXXX"  // Optional - bind a license
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 2. Login a User
**`POST /api/user/login`** (Public)

Authenticate a user with username and password.

**Request:**
```json
{
  "apiKey": "sk_your_api_key",
  "username": "john_doe",
  "password": "secure_password",
  "hwid": "unique-device-id"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "licenseKey": "XXXX-XXXX-XXXX-XXXX"
  }
}
```

### 3. List Users (Protected)
**`GET /api/user/list?appId={appId}`**

Requires authentication token. View all users for your application.

### 4. Delete User (Protected)
**`DELETE /api/user/delete`**

Requires authentication token. Delete a user from your application.

## Integration Examples

### TypeScript/JavaScript

```typescript
const KeyAuthApp = new KeyAuth({
  apiKey: "sk_your_api_key_here"
});

// Register a new user
await KeyAuthApp.register('username', 'password', 'email@example.com');

// Login existing user
if (await KeyAuthApp.login('username', 'password')) {
  console.log('✓ User logged in!');
  // Start your application
}

// Or validate with license key
if (await KeyAuthApp.license('XXXX-XXXX-XXXX-XXXX')) {
  console.log('✓ License valid!');
  // Start your application
}
```

### Python

```python
KeyAuthApp = KeyAuth(api_key="sk_your_api_key_here")

# Register a new user
KeyAuthApp.register('username', 'password', 'email@example.com')

# Login existing user
if KeyAuthApp.login('username', 'password'):
    print('✓ User logged in!')
    # Start your application
```

### C#

```csharp
var KeyAuthApp = new KeyAuth(
    apiKey: "sk_your_api_key_here"
);

// Register a new user
await KeyAuthApp.Register("username", "password", "email@example.com");

// Login existing user
if (await KeyAuthApp.Login("username", "password")) {
    Console.WriteLine("✓ User logged in!");
    // Start your application
}
```

## Use Cases

### License + User Account (Recommended)
Users register with username/password AND bind a license key:

```typescript
// Registration with license
await KeyAuthApp.register('john_doe', 'password123', 'john@email.com', 'LICENSE-KEY');

// Login (automatically checks bound license)
if (await KeyAuthApp.login('john_doe', 'password123')) {
  // Both credentials and license are valid!
}
```

### License Only
Traditional software licensing - no user accounts:

```typescript
if (await KeyAuthApp.license('LICENSE-KEY')) {
  // License is valid
}
```

### User Accounts Only
SaaS-style authentication - no licenses:

```typescript
// Register
await KeyAuthApp.register('username', 'password');

// Login
if (await KeyAuthApp.login('username', 'password')) {
  // User is authenticated
}
```

## Features

✅ **Secure Password Hashing** - Passwords are hashed with bcrypt  
✅ **HWID Tracking** - Track which devices users login from  
✅ **License Binding** - Optionally bind license keys to user accounts  
✅ **Email Support** - Store user emails (optional)  
✅ **Last Login Tracking** - See when users last accessed your app  
✅ **Dashboard Management** - View and manage all users from your dashboard  

## Dashboard Access

View all users for an application:
1. Go to `/dashboard/applications`
2. Click on your application
3. Click "Users & Clients" tab
4. See all registered users, their login history, and bound licenses

## Security Features

- ✅ Passwords are hashed with bcrypt (never stored in plain text)
- ✅ API key validation on every request
- ✅ Application ownership verification
- ✅ HWID tracking for device management
- ✅ License validation for bound accounts

## Firestore Collections

### `appUsers` Collection
Stores end-user accounts created through your applications.

**Structure:**
```javascript
{
  appId: "application-id",
  username: "john_doe",
  password: "hashed_password",
  email: "john@example.com",
  licenseKey: "XXXX-XXXX-XXXX-XXXX",  // If bound
  createdAt: "2025-01-01T00:00:00.000Z",
  lastLogin: "2025-01-01T00:00:00.000Z",
  hwid: "device-unique-id",
  metadata: {}
}
```

## Firestore Security Rules

Add this to your Firestore rules:

```javascript
match /appUsers/{userId} {
  allow read, write: if request.auth != null;
}
```

## Next Steps

1. ✅ Install dependencies: `npm install bcryptjs`
2. 🔥 Enable Firestore (if not already done)
3. 📝 Update Firestore security rules
4. 🚀 Share your API key with developers
5. 👥 Users can now register and login!

Check the **`/docs/sdk`** page for complete integration examples in all languages!

