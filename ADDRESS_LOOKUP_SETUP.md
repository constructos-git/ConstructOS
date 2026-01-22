# Address Lookup Setup Guide

## Overview

The Estimate Builder AI uses address lookup to provide a dropdown list of addresses when you enter a UK postcode. This requires a getAddress.io API key.

## Why is an API Key Needed?

Postcodes.io (the free API we use for postcode validation) doesn't provide individual address lists - it only provides postcode area metadata. To get a full list of addresses for a postcode, you need getAddress.io.

## Setup Instructions

### Step 1: Get a getAddress.io API Key

1. Visit [https://www.getaddress.io/](https://www.getaddress.io/)
2. Sign up for a free account
3. Navigate to your dashboard to get your API key
4. The free tier typically includes a limited number of requests per day

### Step 2: Add API Key to Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add the following line:
   ```
   VITE_GETADDRESS_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual API key from getAddress.io

### Step 3: Restart Development Server

After adding the API key, restart your development server:
```bash
npm run dev
```

## Verification

Once set up:
1. Open the Estimate Builder AI
2. Click on a location card
3. Enter a UK postcode (e.g., "SW1A 1AA")
4. You should see a dropdown list of addresses appear below the address field

## Alternative: Manual Address Entry

If you don't want to set up the API key, you can still manually type addresses in the address field. The system will work fine without the API key - you just won't get the convenient dropdown list.

## Troubleshooting

**Dropdown not appearing:**
- Check that `VITE_GETADDRESS_API_KEY` is set in `.env.local`
- Restart the dev server after adding the key
- Check the browser console for any API errors
- Verify your API key is valid and has remaining requests

**API errors:**
- Check your getAddress.io account for rate limits
- Verify the API key is correct (no extra spaces)
- Check getAddress.io service status

## Cost

getAddress.io offers a free tier with limited requests. For production use, you may need a paid plan. Check their pricing at [https://www.getaddress.io/pricing](https://www.getaddress.io/pricing)
