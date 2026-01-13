# PayTabs Demo Flow Guide

## Quick Demo Flow

### 1. **Sign Up / Login**
- Create an account or login to the platform
- Simple email/password authentication

### 2. **Add PayTabs Credentials**
- Navigate to "API Credentials" in the sidebar
- Click "Add Credential"
- Fill in:
  - **Name**: e.g., "Test Key" or "Production Key"
  - **Profile ID**: From PayTabs dashboard
  - **Server Key**: From PayTabs dashboard
  - **Sandbox Mode**: ✅ Checked (recommended for demo)
- Click "Add Credential"

### 3. **Create PayLink**
- Go to "Create PayLink"
- Select your credential from dropdown
- Fill in payment details:
  - **Cart ID**: Unique identifier (e.g., "CART#1001")
  - **Currency**: Select currency (SAR, USD, etc.)
  - **Amount**: Payment amount
  - **Description**: Payment description
- Click "Create PayLink"
- Copy the PayLink URL from the success message

### 4. **Test Payment**
- Open the PayLink URL in a new tab
- Use PayTabs test card numbers:
  - **Success**: `5123450000000008`
  - **Decline**: `4000000000000002`
  - **3D Secure**: `4000000000003220`
- Complete the payment flow

### 5. **View Webhook Logs**
- Go to "Webhook Logs" in the sidebar
- See payment notifications appear automatically
- Click "View Details" to see full webhook payload
- Check verification status (green = verified, red = unverified)

## PayTabs Account Setup

### Getting Test Credentials

1. **Sign up at PayTabs**
   - Go to https://www.paytabs.com
   - Create a merchant account
   - Access sandbox/test environment

2. **Get API Credentials**
   - Navigate to: Developers > API Keys > Key Management
   - Click (+) to generate new keys
   - Copy:
     - **Profile ID** (numeric, e.g., `987654`)
     - **Server Key** (long string, e.g., `SKXXXXXXXXXXXXXXXXXXXXXXXX`)

3. **Test Mode**
   - Use sandbox credentials for testing
   - No real money is charged
   - Perfect for demos

## Features Implemented

✅ **Sandbox/Test Mode Support**
- Toggle between sandbox and production
- Defaults to sandbox for safety
- Visual indicators show mode status

✅ **Dynamic Webhooks**
- Each user gets unique webhook endpoint
- Format: `/api/webhook/[userId]`
- Automatically configured when creating PayLinks

✅ **Signature Verification**
- HMAC SHA256 verification
- Ensures webhooks are from PayTabs
- Shows verification status in logs

✅ **Complete Payment Flow**
- Add credentials → Create PayLink → Test payment → View webhooks

## Troubleshooting

**404 Errors on Routes:**
- Make sure you're logged in
- Routes are protected - redirects to login if not authenticated
- Check browser console for errors

**PayLink Creation Fails:**
- Verify credentials are correct
- Check if using sandbox URL for test credentials
- Ensure Profile ID and Server Key match

**Webhooks Not Appearing:**
- Make sure your app is accessible (for local dev, use ngrok or similar)
- Check webhook URL is correct in PayLink callback
- Verify signature matches (check Server Key)

## Test Card Numbers (PayTabs Sandbox)

- **Visa Success**: `5123450000000008`
- **Visa Decline**: `4000000000000002`
- **3D Secure**: `4000000000003220`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Environment Variables

Make sure these are set in `.env`:

```env
DATABASE_URL="your-neon-connection-string"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"  # or your Vercel URL
```

## Next Steps for Production

1. **Encrypt Server Keys**: Store credentials encrypted in database
2. **Add IP Restrictions**: Use PayTabs IP restriction feature
3. **Error Handling**: Add better error messages and retry logic
4. **Webhook Retry**: Implement webhook retry mechanism
5. **Payment Status**: Add payment status tracking page
