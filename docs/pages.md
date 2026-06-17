# Pathnames Structure

**For Investors (Regular Users):**

1. **Authentication**

   - ✅ `/auth/login` - OTP login and verification

2. **Profile Management**

   - ✅ `/onboarding` - Initial profile setup
   - ✅ `/profile` - View/edit profile

3. **Property Exploration**

   - ✅ `/listings` - Browse properties, select a property to
   - ✅ `/listings/[id]` - View property details with calculator to enter investment amount to create checkout session

4. **Investor Management**
   - ✅ `/dashboard` - Main dashboard with investments overview, shows stats like:
     - Total properties invested in
     - Total amount invested
     - Total returns per month up to date
     - Total expected returns every month
     - Total amount in the vault
     - Total amount withdrawn up to date
     - ⚠️ Create withdrawal request (Do this in a sheet instead)
   - ⚠️ See withdrawal requests history (Separate page is fine)
   - ✅ `/owned-properties` (Do this in a section below the dashboard) - List of owned properties, shows stats like:
     - Total amount invested
     - Total returns per month up to date
     - Total expected returns every month
5. **Admin Management**
   - ✅ `/admin/properties` - List all properties
   - ✅ `/admin/properties/form?id=[id]` - Add or edit property details
   - ✅ `/admin/properties/[id]` (Do this in a popup instead) - Add monthly rent amount to property to distribute the returns and fill investor's vault
   - ⚠️ `/admin/withdrawal-requests` - List all withdrawal requests, mark them as paid
6. **Support**
   - `/support` - Contact support via email
