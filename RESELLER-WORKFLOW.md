# 🔄 Reseller Workflow - What Happens After Creation

## Overview

This document explains the complete workflow that happens **after** you create a reseller in your Licensify dashboard.

---

## 📋 Step-by-Step Workflow

### **1. Reseller Creation** ✅

When you create a reseller in the dashboard:

#### **What Happens Automatically:**

1. **Unique API Key Generated**
   - Format: `rs_xxxxxxxxxxxxxxxx` (e.g., `rs_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - This is the **only credential** the reseller needs
   - Stored securely in Firestore

2. **Reseller Record Created**
   ```json
   {
     "id": "reseller123",
     "email": "john@distributor.com",
     "name": "John's Distribution",
     "ownerId": "your-user-id",
     "appId": "app123",
     "appName": "My Application",
     "apiKey": "rs_xxxxxxxxxxxxxxxx",
     "isActive": true,
     "createdAt": "2025-01-15T10:30:00Z",
     
     // Permissions
     "canCreateLicenses": true,
     "canViewLicenses": true,
     "canDeleteLicenses": false,
     
     // Limits
     "maxLicenses": -1,  // -1 = unlimited
     "currentLicenses": 0,
     
     // Sales tracking
     "totalSales": 0,
     "totalRevenue": 0,
     "commissionRate": 10
   }
   ```

3. **Success Response**
   - Dashboard shows: ✅ "Reseller created successfully!"
   - Reseller appears in the resellers table
   - **API Key is displayed** (you can copy it)

---

### **2. Share API Key with Reseller** 📤

**What you need to do:**

1. **Copy the API Key** from the resellers dashboard
   - Click the copy icon next to the API key
   - Or manually copy: `rs_xxxxxxxxxxxxxxxx`

2. **Send it to your reseller** via:
   - Email
   - Secure messaging
   - Your reseller portal
   - Documentation

3. **Provide Reseller Portal URL:**
   ```
   https://www.licensify.space/reseller-portal
   ```

---

### **3. Reseller Authentication** 🔐

**What the reseller does:**

1. **Goes to Reseller Portal**
   - URL: `https://www.licensify.space/reseller-portal`
   - Or use the API directly: `POST /api/reseller/auth`

2. **Enters their API Key**
   ```json
   {
     "apiKey": "rs_xxxxxxxxxxxxxxxx"
   }
   ```

3. **System Validates:**
   - ✅ Checks if API key exists
   - ✅ Verifies reseller is **active**
   - ✅ Updates `lastLoginAt` timestamp
   - ✅ Returns reseller information

4. **Authentication Response:**
   ```json
   {
     "success": true,
     "reseller": {
       "id": "reseller123",
       "name": "John's Distribution",
       "email": "john@distributor.com",
       "appId": "app123",
       "appName": "My Application",
       "isActive": true,
       "canCreateLicenses": true,
       "canViewLicenses": true,
       "canDeleteLicenses": false,
       "maxLicenses": -1,
       "currentLicenses": 0,
       "totalSales": 0,
       "commissionRate": 10
     }
   }
   ```

---

### **4. Reseller Can Now Create Licenses** 🎫

**Once authenticated, the reseller can:**

#### **Option A: Use Reseller Portal (Web UI)**

1. **Login** with API key
2. **Fill out license form:**
   - Expiry Days (e.g., 30)
   - Max Devices (e.g., 1)
   - Customer Email (optional)
   - Customer Name (optional)
3. **Click "Create License"**
4. **Get license key immediately**

#### **Option B: Use API Directly**

**Endpoint:** `POST /api/reseller/create-license`

**Request:**
```json
{
  "apiKey": "rs_xxxxxxxxxxxxxxxx",
  "expiryDays": 30,
  "maxDevices": 1,
  "customerEmail": "customer@example.com",
  "customerName": "John Customer",
  "metadata": {
    "orderId": "ORD-12345",
    "plan": "premium"
  }
}
```

**What Happens:**

1. **System Validates:**
   - ✅ API key is valid
   - ✅ Reseller is active
   - ✅ Reseller has `canCreateLicenses` permission
   - ✅ Reseller hasn't exceeded `maxLicenses` limit

2. **License Created:**
   ```json
   {
     "id": "license456",
     "key": "XXXX-XXXX-XXXX-XXXX",
     "appId": "app123",
     "appName": "My Application",
     "expiresAt": "2025-02-14T10:30:00Z",
     "maxDevices": 1,
     "isActive": true,
     
     // Reseller tracking
     "resellerId": "reseller123",
     "resellerName": "John's Distribution",
     "resellerEmail": "john@distributor.com",
     
     // Customer info
     "customerEmail": "customer@example.com",
     "customerName": "John Customer",
     
     "metadata": {
       "createdByReseller": true,
       "orderId": "ORD-12345",
       "plan": "premium"
     }
   }
   ```

3. **Reseller Stats Updated:**
   - `currentLicenses`: 0 → 1
   - `totalSales`: 0 → 1
   - `lastSaleAt`: Updated to current timestamp

4. **Response:**
   ```json
   {
     "success": true,
     "license": {
       "id": "license456",
       "key": "XXXX-XXXX-XXXX-XXXX",
       ...
     },
     "message": "License created successfully"
   }
   ```

---

### **5. License Usage** 🚀

**The reseller gives the license key to their customer:**

1. **Customer receives:** `XXXX-XXXX-XXXX-XXXX`
2. **Customer uses it** in the software application
3. **License validation** happens via `/api/license/validate`
4. **License is tracked** back to the reseller:
   - `resellerId`: "reseller123"
   - `resellerName`: "John's Distribution"
   - `resellerEmail`: "john@distributor.com"

---

### **6. Monitoring & Analytics** 📊

**As the owner, you can monitor:**

#### **Dashboard Stats:**
- **Total Resellers**: Count of all resellers
- **Active Resellers**: Currently active resellers
- **Total Sales**: Licenses sold by all resellers
- **Total Revenue**: Revenue from reseller sales

#### **Per-Reseller Stats:**
- **Sales Count**: How many licenses they've created
- **Current Licenses**: Active licenses created by them
- **Commission Rate**: Their commission percentage
- **Last Sale**: When they last created a license
- **Last Login**: When they last authenticated

#### **Reseller Table Shows:**
- Name & Contact info
- Application they sell for
- API Key (with copy button)
- Status (Active/Inactive)
- Sales count & commission rate
- License usage (current / max)

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. YOU CREATE RESELLER                                      │
│    Dashboard → Resellers → Add Reseller                     │
│    ✅ API Key Generated: rs_xxxxxxxxxxxxxxxx                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. SHARE API KEY                                            │
│    Copy API Key → Send to Reseller                          │
│    📧 Email / 📱 Message / 📄 Documentation                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RESELLER AUTHENTICATES                                   │
│    POST /api/reseller/auth                                  │
│    { "apiKey": "rs_xxxxxxxxxxxxxxxx" }                      │
│    ✅ Validates → Returns reseller info                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RESELLER CREATES LICENSE                                 │
│    POST /api/reseller/create-license                        │
│    { "apiKey": "...", "expiryDays": 30, ... }               │
│    ✅ License Created: XXXX-XXXX-XXXX-XXXX                  │
│    ✅ Stats Updated: currentLicenses++, totalSales++        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RESELLER GIVES LICENSE TO CUSTOMER                       │
│    Customer receives: XXXX-XXXX-XXXX-XXXX                    │
│    Customer uses it in software                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CUSTOMER VALIDATES LICENSE                               │
│    POST /api/license/validate                               │
│    { "licenseKey": "XXXX-XXXX-XXXX-XXXX", "hwid": "..." }   │
│    ✅ License tracked to reseller                           │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. YOU MONITOR IN DASHBOARD                                 │
│    Dashboard → Resellers                                     │
│    📊 View stats, sales, license counts                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### **API Key Security:**
- ✅ Unique per reseller (cannot be guessed)
- ✅ Format: `rs_` prefix + 32 random characters
- ✅ Stored securely in Firestore
- ✅ Only accessible by owner

### **Authentication:**
- ✅ API key must be valid
- ✅ Reseller must be **active**
- ✅ Permissions checked before actions
- ✅ Limits enforced per reseller

### **Tracking:**
- ✅ Every license linked to reseller
- ✅ All actions logged
- ✅ Stats updated in real-time
- ✅ Owner can see all reseller activity

---

## 📝 Important Notes

### **For You (Owner):**

1. **Keep API Keys Secure**
   - Don't share publicly
   - Send via secure channels
   - Can revoke by deactivating reseller

2. **Set Appropriate Limits**
   - `maxLicenses`: How many licenses reseller can create
   - Set to `-1` for unlimited
   - Monitor usage in dashboard

3. **Manage Permissions**
   - `canCreateLicenses`: Allow license creation
   - `canViewLicenses`: Allow viewing licenses
   - `canDeleteLicenses`: Allow deleting licenses (use carefully)

4. **Monitor Activity**
   - Check `lastLoginAt` to see if reseller is active
   - Review `totalSales` to track performance
   - Watch `currentLicenses` vs `maxLicenses`

### **For Resellers:**

1. **Protect Your API Key**
   - Don't share it publicly
   - Don't commit to code repositories
   - Use environment variables

2. **Check Limits**
   - Know your `maxLicenses` limit
   - Check `currentLicenses` before creating
   - Contact owner if limit reached

3. **Track Your Sales**
   - Use reseller portal to see stats
   - Monitor `totalSales` count
   - Keep track of commission rate

---

## 🚀 Quick Reference

### **Reseller Portal:**
```
https://www.licensify.space/reseller-portal
```

### **API Endpoints:**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/reseller/auth` | POST | API Key | Authenticate reseller |
| `/api/reseller/create-license` | POST | API Key | Create license |
| `/api/reseller/stats` | POST | API Key | Get reseller stats |

### **Owner Endpoints:**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/reseller/create` | POST | Firebase Token | Create reseller |
| `/api/reseller/list` | GET | Firebase Token | List resellers |
| `/api/reseller/update` | POST | Firebase Token | Update reseller |
| `/api/reseller/delete` | DELETE | Firebase Token | Delete reseller |

---

## ✅ Summary

**After creating a reseller:**

1. ✅ **API Key Generated** - Unique identifier for reseller
2. ✅ **Reseller Record Created** - Stored in database
3. ✅ **Share API Key** - Send to reseller securely
4. ✅ **Reseller Authenticates** - Uses API key to login
5. ✅ **Reseller Creates Licenses** - Via portal or API
6. ✅ **Licenses Tracked** - All linked back to reseller
7. ✅ **You Monitor** - View stats in dashboard

**That's it!** The reseller can now start creating and selling licenses for your application! 🎉

