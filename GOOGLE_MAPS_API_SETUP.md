# Google Maps API Setup Guide

## Step 1: Enable Required APIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable these APIs:
   - **Maps Embed API** (for the map embed)
   - **Maps JavaScript API** (optional, for advanced features)
   - **Geocoding API** (for address lookup)

## Step 2: Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API Key**
3. Copy your API key (you'll see it in a popup)

## Step 3: Restrict Your API Key (Recommended for Security)

1. Click on your newly created API key to edit it
2. Under **API restrictions**, select **Restrict key**
3. Select these APIs:
   - Maps Embed API
   - Maps JavaScript API (if enabled)
   - Geocoding API (if enabled)
4. Under **Application restrictions**, you can:
   - **HTTP referrers (web sites)**: Add your domain (e.g., `localhost:5173/*`, `yourdomain.com/*`)
   - Or leave it unrestricted for development (not recommended for production)
5. Click **SAVE**

## Step 4: Add API Key to Your Project

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. **Important**: Add `.env` to your `.gitignore` file to keep your key secure

## Step 5: Restart Your Development Server

After adding the API key, restart your Vite dev server:
```bash
npm run dev
```

## Cost Information

- **Maps Embed API**: Free (unlimited requests)
- **Maps JavaScript API**: Free up to $200/month credit
- **Geocoding API**: Free up to $200/month credit

Google provides $200 in free credits per month, which is typically enough for most applications.

## Troubleshooting

- If maps don't load, check the browser console for errors
- Make sure the API key is correctly set in your `.env` file
- Verify that the required APIs are enabled in Google Cloud Console
- Check that your API key restrictions allow your domain
