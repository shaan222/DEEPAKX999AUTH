# 🤝 Reseller Management System - Complete Guide

## 📋 Overview

The Reseller Management System allows you to create and manage resellers who can sell licenses for your applications on your behalf. This is perfect for:

- **Software distributors** who need regional sales teams
- **SaaS providers** with partner networks
- **B2B applications** with multiple sales channels
- **Affiliate programs** with commission tracking

---

## ✨ Key Features

### For Application Owners:

✅ **Create & Manage Resellers**
- Add **1 reseller** per application (Free tier)
- **Unlimited resellers** on Pro tier
- Each reseller gets a unique API key
- Full permission control

✅ **Granular Permissions**
- Can create licenses (yes/no)
- Can view licenses (yes/no)
- Can delete licenses (yes/no)

✅ **License Limits**
- Set maximum licenses per reseller
- Track current usage
- Unlimited option available

✅ **Sales Tracking**
- Total sales per reseller
- Revenue tracking
- Commission rate management
- Top performer analytics

✅ **Reseller Analytics**
- Last login tracking
- Last sale date
- Active vs inactive status
- Performance metrics

### For Resellers:

✅ **Simple Portal**
- Login with API key
- Clean, intuitive dashboard
- Real-time stats

✅ **License Creation**
- Create licenses for customers
- Set expiry and device limits
- Automatic key generation
- Copy to clipboard

✅ **Performance Dashboard**
- View total sales
- Track active licenses
- Monitor usage limits
- See commission rate

---

## 🎯 Limits & Restrictions

### Subscription Limits:

| Tier | Max Resellers per App | Reseller Feature Enabled |
|------|----------------------|--------------------------|
| **Free** | **1** | ✅ Yes |
| **Pro** | **Unlimited** | ✅ Yes |

### Reseller Restrictions:

- ✅ **One reseller can only belong to ONE account** (owner)
- ✅ Each reseller is tied to ONE specific application
- ✅ Resellers can only create licenses for their assigned app
- ✅ Owner controls all reseller permissions
- ✅ Owner can set license limits per reseller

---

## 🚀 Quick Start Guide

### Step 1: Create a Reseller

1. **Go to Dashboard → Resellers**
2. **Click "Add Reseller"**
3. **Fill in details:**
   - Name: John's Distribution
   - Email: john@distributor.com
   - Select Application
   - Set max licenses (-1 = unlimited)
   - Set commission rate (optional)
   - Configure permissions
4. **Click "Create Reseller"**
5. **Copy the API key** and send it to your reseller

### Step 2: Reseller Access

1. **Reseller goes to:** `https://www.licensify.space/reseller-portal`
2. **Enters their API key**
3. **Can now create licenses!**

---

## 📊 Dashboard Features

### For Application Owners

Navigate to **Dashboard → Resellers** to see:

#### Stats Overview:
- **Total Resellers** - How many resellers you have
- **Active Resellers** - Currently active resellers
- **Total Sales** - Licenses sold by all resellers
- **Total Revenue** - Revenue from reseller sales

#### Resellers Table:
- **Name & Contact** - Reseller details
- **Application** - Which app they sell for
- **API Key** - Unique reseller key (copy button)
- **Status** - Active/Inactive badge
- **Sales** - Total sales & commission rate
- **Licenses** - Current usage vs limit
- **Actions** - Delete reseller

---

## 🔐 API Endpoints

### For Application Owners (Require Firebase Auth Token):

#### **1. Create Reseller**
```http
POST /api/reseller/create
Authorization: Bearer <firebase-token>

Request Body:
{
  "appId": "app123",
  "name": "John's Distribution",
  "email": "john@example.com",
  "phone": "+1 234 567 8900",
  "company": "Distribution Co",
  "maxLicenses": -1,
  "commissionRate": 10,
  "canCreateLicenses": true,
  "canViewLicenses": true,
  "canDeleteLicenses": false,
  "notes": "Regional distributor for North America"
}

Response:
{
  "success": true,
  "reseller": {
    "id": "reseller123",
    "apiKey": "rs_xxxxxxxxxxxxxxxx",
    ...
  }
}
```

#### **2. List Resellers**
```http
GET /api/reseller/list?appId=app123
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "resellers": [...],
  "stats": {
    "total": 5,
    "active": 4,
    "totalSales": 150
  }
}
```

#### **3. Update Reseller**
```http
POST /api/reseller/update
Authorization: Bearer <firebase-token>

Request Body:
{
  "resellerId": "reseller123",
  "name": "Updated Name",
  "isActive": false,
  "maxLicenses": 100
}
```

#### **4. Delete Reseller**
```http
DELETE /api/reseller/delete
Authorization: Bearer <firebase-token>

Request Body:
{
  "resellerId": "reseller123"
}
```

#### **5. Get Reseller Stats**
```http
POST /api/reseller/stats
Authorization: Bearer <firebase-token>

Request Body:
{
  "resellerId": "reseller123"
}

Response:
{
  "success": true,
  "stats": {
    "licenses": {
      "total": 50,
      "active": 45,
      "expired": 5
    },
    "sales": {
      "totalSales": 50,
      "totalRevenue": 5000,
      "commissionEarned": 500
    }
  }
}
```

---

### For Resellers (Require Reseller API Key):

#### **1. Reseller Authentication**
```http
POST /api/reseller/auth

Request Body:
{
  "apiKey": "rs_xxxxxxxxxxxxxxxx"
}

Response:
{
  "success": true,
  "reseller": {
    "id": "reseller123",
    "name": "John's Distribution",
    "appName": "MyApp",
    "canCreateLicenses": true,
    "maxLicenses": 100,
    "currentLicenses": 25
  }
}
```

#### **2. Create License (Reseller)**
```http
POST /api/reseller/create-license

Request Body:
{
  "apiKey": "rs_xxxxxxxxxxxxxxxx",
  "expiryDays": 30,
  "maxDevices": 1,
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name"
}

Response:
{
  "success": true,
  "license": {
    "id": "license123",
    "key": "XXXX-XXXX-XXXX-XXXX",
    "expiresAt": "2025-12-05",
    "resellerId": "reseller123",
    "customerEmail": "customer@example.com"
  }
}
```

#### **3. Get Stats (Reseller)**
```http
POST /api/reseller/stats

Request Body:
{
  "apiKey": "rs_xxxxxxxxxxxxxxxx"
}

Response:
{
  "success": true,
  "stats": {
    "licenses": {...},
    "sales": {...},
    "limits": {...}
  },
  "licenses": [...]  // Last 10 licenses
}
```

---

## 💡 Use Cases & Examples

### Use Case 1: Regional Distributor

**Scenario:** You sell software in multiple regions and want local distributors.

```javascript
// Create distributor for North America
const response = await fetch('/api/reseller/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    appId: 'myapp123',
    name: 'North America Distribution',
    email: 'na@distributor.com',
    maxLicenses: 500,  // Can sell up to 500 licenses
    commissionRate: 15, // 15% commission
    canCreateLicenses: true,
    canViewLicenses: true,
    canDeleteLicenses: false
  })
});

// Distributor uses their API key to create licenses
const licenseResponse = await fetch('/api/reseller/create-license', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'rs_northamerica_xxxxx',
    expiryDays: 365,
    maxDevices: 5,
    customerEmail: 'enterprise@company.com',
    customerName: 'Enterprise Corp'
  })
});
```

### Use Case 2: Affiliate Program

**Scenario:** Multiple affiliates selling your software with commission tracking.

```javascript
// Create affiliate
await createReseller({
  name: 'Tech Influencer',
  email: 'influencer@youtube.com',
  maxLicenses: -1,  // Unlimited
  commissionRate: 20,  // 20% commission
  canCreateLicenses: true,
  notes: 'YouTube tech channel with 100K subscribers'
});
```

### Use Case 3: Partner Sales Team

**Scenario:** B2B SaaS with a partner network.

```javascript
// Create partner
await createReseller({
  name: 'Enterprise Solutions Partner',
  company: 'BigCorp Consulting',
  maxLicenses: 1000,
  commissionRate: 10,
  canCreateLicenses: true,
  canViewLicenses: true,
  canDeleteLicenses: true,  // Partners can manage their licenses
});
```

---

## 🔒 Security Features

### API Key Security:
- ✅ Unique API key per reseller (starts with `rs_`)
- ✅ API keys are secret - never displayed after creation
- ✅ API keys cannot be regenerated (delete & recreate instead)

### Permission Control:
- ✅ Owner controls all permissions
- ✅ Resellers can only access their assigned app
- ✅ Cannot view or modify other resellers
- ✅ Cannot exceed license limits

### Data Privacy:
- ✅ Resellers only see their own data
- ✅ Owner sees all reseller data
- ✅ License ownership stays with app owner
- ✅ Reseller info tracked on each license

---

## 📈 Analytics & Reporting

### Reseller Performance Tracking:

```javascript
// Get detailed stats for a reseller
const stats = await fetch('/api/reseller/stats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    resellerId: 'reseller123'
  })
});

// Returns:
{
  "licenses": {
    "total": 150,
    "active": 120,
    "expired": 30
  },
  "sales": {
    "totalSales": 150,
    "totalRevenue": 15000,
    "commissionRate": 10,
    "commissionEarned": 1500
  },
  "limits": {
    "maxLicenses": 500,
    "currentLicenses": 150,
    "remaining": 350
  }
}
```

---

## 🎨 Customization Options

### Per-Reseller Settings:

```javascript
{
  "maxLicenses": -1,           // -1 = unlimited, or set a number
  "commissionRate": 10,         // 0-100 percentage
  "canCreateLicenses": true,    // Can create new licenses
  "canViewLicenses": true,      // Can view license list
  "canDeleteLicenses": false,   // Can delete licenses
  "isActive": true,             // Enable/disable reseller
  "notes": "Internal notes",    // Private notes for owner
}
```

---

## ⚠️ Important Notes

### Limits Enforcement:

1. **Reseller Limit per App:**
   - Free tier: **1 reseller** per application
   - Pro tier: **Unlimited resellers**

2. **One Account Rule:**
   - Each reseller email can only belong to ONE owner
   - Prevents reseller from working for multiple companies
   - Ensures exclusive distribution

3. **License Attribution:**
   - All licenses created by resellers are attributed to them
   - Owner can see which reseller created each license
   - Reseller info stored on license: `resellerId`, `resellerName`, `resellerEmail`

### Best Practices:

✅ **Set reasonable license limits** - Prevent abuse
✅ **Track commission rates** - For accounting
✅ **Use customer fields** - Track end customers
✅ **Monitor reseller activity** - Check last login/sale dates
✅ **Deactivate inactive resellers** - Keep list clean
✅ **Add notes** - Remember important details

---

## 🚨 Error Handling

### Common Errors:

```javascript
// Reseller limit reached (Free tier)
{
  "error": "Maximum reseller limit (1) reached for this application",
  "limitReached": true,
  "current": 1,
  "limit": 1,
  "upgradeRequired": true
}

// Reseller email already exists
{
  "error": "A reseller with this email already exists in your account"
}

// Reseller license limit reached
{
  "error": "License creation limit reached. You can create up to 100 licenses.",
  "limitReached": true,
  "current": 100,
  "limit": 100
}

// Invalid API key
{
  "error": "Invalid API key"
}

// Reseller inactive
{
  "error": "Reseller account is inactive. Please contact the administrator."
}

// No permission
{
  "error": "You do not have permission to create licenses"
}
```

---

## 📱 Reseller Portal

### Access:
```
https://www.licensify.space/reseller-portal
```

### Features:
- ✅ Simple login with API key
- ✅ Dashboard with stats
- ✅ License creation form
- ✅ Real-time usage tracking
- ✅ Auto-copy license keys

### Screenshots:

**Login:**
```
┌─────────────────────────────┐
│  Reseller Portal            │
│  Enter your API key         │
│                             │
│  [API Key: ____________]    │
│                             │
│  [     Login     ]          │
└─────────────────────────────┘
```

**Dashboard:**
```
┌───────────────────────────────────────┐
│  Welcome, John's Distribution!        │
│  Reseller for: MyApp                  │
│                                       │
│  [Total Sales] [Active] [Created]    │
│      150         120       150/500    │
│                                       │
│  Create New License:                  │
│  Customer: [___________]              │
│  Expiry:   [30] days                  │
│  Devices:  [1]                        │
│  [  Create License  ]                 │
└───────────────────────────────────────┘
```

---

## 🔄 Workflow Examples

### Complete Reseller Workflow:

```mermaid
Owner Creates Reseller → Sends API Key → Reseller Logs In → Creates Licenses → Customers Use Licenses
```

**Step by Step:**

1. **Owner:** Creates reseller in dashboard
2. **Owner:** Copies API key and sends to reseller (email/secure channel)
3. **Reseller:** Goes to reseller portal
4. **Reseller:** Enters API key and logs in
5. **Reseller:** Sees their dashboard and stats
6. **Reseller:** Creates license for customer
7. **Reseller:** License key auto-copied to clipboard
8. **Reseller:** Sends license key to customer
9. **Customer:** Uses license key in the application
10. **Owner:** Sees reseller's sales in dashboard

---

## 💼 Database Schema

### Resellers Collection:

```javascript
{
  id: "reseller123",
  email: "reseller@example.com",
  name: "John's Distribution",
  ownerId: "owner123",         // Main account owner
  appId: "app123",             // Assigned application
  appName: "MyApp",
  apiKey: "rs_xxxxx",          // Unique API key
  isActive: true,
  createdAt: "2024-11-04",
  
  // Permissions
  canCreateLicenses: true,
  canViewLicenses: true,
  canDeleteLicenses: false,
  
  // Limits
  maxLicenses: 500,
  currentLicenses: 150,
  
  // Sales
  totalSales: 150,
  totalRevenue: 15000,
  commissionRate: 10,
  
  // Activity
  lastSaleAt: "2024-11-04",
  lastLoginAt: "2024-11-04",
  
  // Contact
  phone: "+1 234 567 8900",
  company: "Distribution Co",
  notes: "Regional distributor"
}
```

### License with Reseller Info:

```javascript
{
  id: "license123",
  key: "XXXX-XXXX-XXXX-XXXX",
  userId: "owner123",          // App owner
  appId: "app123",
  
  // Reseller tracking
  resellerId: "reseller123",
  resellerName: "John's Distribution",
  resellerEmail: "reseller@example.com",
  
  // Customer info
  customerEmail: "customer@example.com",
  customerName: "Customer Name",
  
  // License details
  expiresAt: "2025-12-05",
  maxDevices: 1,
  createdAt: "2024-11-04",
  
  metadata: {
    createdByReseller: true
  }
}
```

---

## 📚 Additional Resources

### For Owners:
- Dashboard: `/dashboard/resellers`
- API Documentation: `/dashboard/docs/api`

### For Resellers:
- Portal: `/reseller-portal`
- Support: Contact your administrator

---

## ✅ Summary

**The Reseller Management System enables:**

- ✅ Easy partner/distributor management
- ✅ Controlled license distribution
- ✅ Sales tracking and analytics
- ✅ Commission calculation
- ✅ Granular permission control
- ✅ Scalable distribution network

**Perfect for:**
- Software distributors
- Affiliate programs
- Partner networks
- Regional sales teams
- B2B SaaS platforms

---

## 🎉 You're All Set!

Start building your reseller network today:

1. ✅ Go to Dashboard → Resellers
2. ✅ Create your first reseller
3. ✅ Send them their API key
4. ✅ Watch the sales roll in!

**Questions?** Check the API documentation or contact support.

---

**Built with ❤️ by Licensify Team**
- **Founder:** MD. FAIZAN
- **CTO:** Shivam Jnath

🚀 **Happy Selling!**

