# Quick Start Guide

## Get Started in 3 Minutes

### 1. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/)

### 2. First Campaign
1. Click through the welcome modal
2. Fill out campaign form:
   - **Name**: "Summer Sale 2025"
   - **Vertical**: E-commerce
   - **Objective**: Performance
   - **Budget**: $1000/day
   - **Devices**: ✓ All (Desktop, Mobile, Tablet)
   - **Geos**: ✓ US, UK, CA
3. Enable AI Monitoring with **Balanced** sensitivity
4. Wait for the setup animation (5 seconds)

### 3. View Dashboard
- See your campaign in the dashboard
- 20% chance it has active alarms (demo data)
- Click any alarm to see AI insights
- Click "Apply Recommendation" to test interactions

## Key Features to Try

### Create Multiple Campaigns
- Try different verticals (Finance, SaaS, Travel)
- Different objectives (Brand Awareness, Video)
- Notice how baseline metrics change

### Explore Alarms
- **Critical Alarms** (red) - Major issues, immediate action needed
- **High Priority** (amber) - Performance degradation
- **Medium Priority** (yellow) - Minor issues
- **Low Priority** (gray) - Optimization opportunities

### Test Sensitivity Levels
- **Strict** (±15%) - More alerts, catch issues early
- **Balanced** (±25%) - Recommended for most campaigns
- **Loose** (±40%) - Fewer alerts, major issues only

## Demo Data Explained

### Simulated Metrics
All data is generated with realistic patterns:
- **Time-of-day**: B2B peaks 9am-5pm, B2C peaks 7pm-10pm
- **Day-of-week**: B2B drops on weekends, B2C stays stable
- **Noise**: Random ±15% variation for realism
- **Anomalies**: 20% of campaigns have issues injected

### Anomaly Types
1. **Sudden Drop**: CTR drops 40-60% suddenly
2. **Spike**: Budget overrun, 150-200% increase
3. **Gradual Decline**: 3-5% decrease per day
4. **Dimensional**: One geo/device performs poorly

### AI Insights (Mock Mode)
Default insights are pre-generated patterns:
- Root causes based on metric type
- Confidence levels (High, Medium, Low)
- Actionable recommendations
- Financial impact estimates

## Enable Real Gemini AI

1. Get API key: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Edit `src/services/gemini.ts`:
   ```typescript
   const USE_MOCK = false;
   const API_KEY = 'your-api-key-here';
   ```
3. Rebuild: `npm run dev`

## Keyboard Shortcuts

- **Escape** - Close modals
- **Cmd/Ctrl + R** - Refresh page to generate new data

## Browser DevTools

Open DevTools → Application → Cookies to see:
- `app_campaigns` - Campaign data
- `app_monitors` - Monitor configurations
- `app_alarms` - Active and historical alarms
- `app_metric_values` - Time-series data (7 days)
- `app_onboarding_state` - Progress tracking

## Reset Everything

Clear all data to start fresh:
```javascript
// In browser console
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
location.reload();
```

## Common Questions

**Q: Why don't I see any alarms?**
A: Only 20% of campaigns have simulated anomalies. Create 3-5 campaigns to see variety.

**Q: How do I make an alarm appear?**
A: Anomalies are randomly seeded based on campaign ID. Delete and recreate campaigns until you get an active alarm.

**Q: Can I export data?**
A: Yes! Open browser console:
```javascript
// Export all data
JSON.stringify(document.cookie)

// Or use the utility function if you import storage.ts
exportAllData()
```

**Q: Where's the historical chart?**
A: The alarm detail modal shows metric comparison. Full charts can be added in future versions.

**Q: How do notifications work?**
A: The settings page configures notification preferences, but actual sending is not implemented in demo mode.

## Troubleshooting

### "No campaigns found"
- Create your first campaign using the button
- Check cookies aren't blocked in your browser

### "Blank screen"
- Check console for errors (F12)
- Verify npm install completed successfully
- Try `rm -rf node_modules && npm install`

### "Port 5173 in use"
- Kill existing process: `lsof -ti:5173 | xargs kill -9`
- Or use different port: `npm run dev -- --port 3000`

## Production Build

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Output in dist/ folder
```

## Next Steps

1. Explore the codebase in `src/`
2. Modify colors in `tailwind.config.js`
3. Add custom metrics in `src/types/index.ts`
4. Extend simulation logic in `src/services/simulation.ts`
5. Connect real APIs by replacing storage.ts with actual backend calls

---

**Happy monitoring!** 🎯📊🚀
