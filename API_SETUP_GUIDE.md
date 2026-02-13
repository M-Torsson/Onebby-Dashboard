# API Configuration Guide

## 🔑 Setting Up Your API Key

To connect to the Onebby API, you need to update the API key in the following files:

### 1. Users List
**File:** `src/views/apps/ecommerce/users/list/UserListTable.jsx`

**Line 93:** Replace `'your-api-key-here'` with your actual API key:
```javascript
'X-API-Key': 'YOUR_ACTUAL_API_KEY'
```

### 2. Company Users List
**File:** `src/views/apps/ecommerce/company-users/list/CompanyUserListTable.jsx`

**Line 98:** Replace `'your-api-key-here'` with your actual API key:
```javascript
'X-API-Key': 'YOUR_ACTUAL_API_KEY'
```

**Line 139:** Also update the same in the status update function:
```javascript
'X-API-Key': 'YOUR_ACTUAL_API_KEY'
```

---

## 📋 What Was Changed

### Navigation Menu
- Changed "Customers" to "Users" in the sidebar
- Added new "Company Users" menu item below Users

### Pages Created
1. **Users Page** (`/apps/ecommerce/users/list`)
   - Displays all registered users (customers)
   - Shows: User ID, Name, Email, Status, Registration Date
   - **No "Total Spent" column** (as requested)
   
2. **Company Users Page** (`/apps/ecommerce/company-users/list`)
   - Displays all registered companies
   - Shows: Company ID, Name, Email, VAT Number, Tax Code
   - **Special Feature:** Approval Status dropdown
     - Click on status chip to change between: Approved, Pending, Rejected
     - Updates via API automatically

---

## 🎯 Features

### Users Table
- ✅ Displays User ID (like #879861)
- ✅ Shows user full name with title
- ✅ Email address
- ✅ Active/Inactive status
- ✅ Registration date
- ✅ Search functionality
- ✅ Pagination (10, 25, 50, 100 per page)
- ✅ Export button (ready for implementation)

### Company Users Table
- ✅ Displays Company ID
- ✅ Shows company name and email
- ✅ VAT Number and Tax Code
- ✅ **Approval Status with dropdown:**
  - 🟢 Approved
  - 🟡 Pending
  - 🔴 Rejected
- ✅ Active/Inactive status
- ✅ Registration date
- ✅ Search functionality
- ✅ Pagination
- ✅ Export button

---

## 🔄 API Endpoints Used

### Users (Customers)
- **GET** `https://onebby-api.onrender.com/api/users/customers`
  - Fetches all users

### Companies
- **GET** `https://onebby-api.onrender.com/api/users/companies`
  - Fetches all companies

- **PUT** `https://onebby-api.onrender.com/api/users/companies/{id}`
  - Updates company approval status
  - Body: `{ "approval_status": "approved" | "pending" | "rejected" }`

---

## 🚀 Next Steps

1. **Update API Keys** in both table files
2. **Test the pages:**
   - Navigate to: `/en/apps/ecommerce/users/list`
   - Navigate to: `/en/apps/ecommerce/company-users/list`
3. **Verify data is loading** from the API
4. **Test the approval status dropdown** on company users

---

## ⚠️ Important Notes

- Both pages use **client-side data fetching**
- Data updates automatically when approval status changes
- Loading states are handled for better UX
- All tables are responsive and mobile-friendly
- Search works across all visible columns

---

## 🛠️ Troubleshooting

If data doesn't load:
1. Check API key is correct
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Ensure CORS is properly configured on API

If approval status doesn't update:
1. Verify API key has write permissions
2. Check network tab for failed requests
3. Ensure company ID is valid
