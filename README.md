# Campaign Anomaly Detection & Alerting System

A fully functional MVP demo application showcasing AI-powered campaign monitoring for digital advertising platforms (DSP). This application demonstrates real-time anomaly detection, intelligent alerting, and actionable insights powered by Google Gemini AI.

## 🎯 Features

### Core Functionality
- **Real-Time Monitoring**: Track 15+ performance metrics across campaigns 24/7
- **AI-Powered Anomaly Detection**: Machine learning baselines with configurable sensitivity
- **Intelligent Alerting**: Severity-based notifications (Critical, High, Medium, Low)
- **Actionable Insights**: Google Gemini-powered root cause analysis and recommendations
- **Multi-Dimensional Analysis**: Break down issues by geography, device, and placement
- **Interactive Dashboard**: Beautiful, production-quality UI with real-time updates

### Metrics Monitored
- **Volume**: Impressions, Clicks, Conversions, Impression Share
- **Efficiency**: CTR, CVR, CPA, CPM, CPC, ROAS
- **Quality**: Viewability, Invalid Traffic %, Ad Load Time
- **Financial**: Spend, Budget Utilization, Pacing

### User Experience
- **Guided Onboarding**: First-time user welcome with feature highlights
- **3-Step Campaign Creation**: Easy setup with validation and visual targeting
- **Sensitivity Controls**: Choose from Strict (±15%), Balanced (±25%), or Loose (±40%) thresholds
- **Alarm Management**: View, dismiss, and resolve alarms with AI recommendations
- **Cookie-Based Persistence**: All data stored in browser cookies (no backend required)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone or navigate to project directory
cd media-net-2

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at [http://localhost:5173/](http://localhost:5173/)

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 📖 User Guide

### First-Time Setup

1. **Welcome Modal**: On your first visit, you'll see a welcome modal explaining the features
2. **Create Campaign**: Click "Create Your First Campaign" to start
3. **Fill Campaign Details**:
   - Name your campaign
   - Select vertical (E-commerce, Finance, SaaS, etc.)
   - Choose objective (Performance, Brand Awareness, etc.)
   - Set daily budget and campaign flight dates
   - Configure targeting (devices and geographies)
4. **Enable Monitoring**: Choose AI-powered monitoring and select sensitivity level
5. **View Dashboard**: See your campaign with real-time anomaly detection

### Using the Dashboard

- **Status Summary**: View campaign health at a glance (Critical, High, Medium, Low, Healthy)
- **Active Alarms**: Click any alarm to see detailed analysis
- **AI Insights**: Each alarm includes:
  - Plain-English summary of what happened
  - Root cause analysis with confidence levels
  - Specific recommendations to fix the issue
  - Estimated financial impact
- **Apply Recommendations**: One-click to apply suggested fixes (demo mode)

### Creating Additional Campaigns

1. Click "Create Campaign" in the navigation
2. Follow the 3-step wizard
3. Campaigns are automatically monitored with simulated historical data

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS (utility-first, no custom config)
- **Icons**: Lucide React
- **Charts**: Recharts (for future visualization features)
- **Routing**: React Router v6
- **State Management**: React Context API
- **Data Persistence**: Browser Cookies (js-cookie)
- **AI Integration**: Google Gemini 1.5 Pro API
- **Build Tool**: Vite
- **Date Handling**: date-fns

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Critical Alarms**: Red (#DC2626)
- **High Priority**: Amber (#F59E0B)
- **Medium Priority**: Yellow (#EAB308)
- **Low Priority**: Gray (#6B7280)
- **Success**: Green (#10B981)

### Typography
- **Font**: Inter (with system fallbacks)
- **Monospace**: Fira Code (for metric values)

### Components
All UI components follow a consistent design system with:
- Rounded corners (4-8px)
- Subtle shadows for depth
- Smooth transitions (200ms)
- Hover effects on interactive elements
- Responsive grid layouts

## 📊 Demo Mode

The application runs in **demo mode** by default with simulated data:

### Simulated Features
- ✅ Realistic metric values based on campaign vertical and objective
- ✅ Time-of-day and day-of-week patterns (B2B vs B2C)
- ✅ Anomaly injection (20% of campaigns have issues)
- ✅ AI-powered insights (mock generator with realistic responses)
- ✅ 7 days of historical data (hourly granularity)
- ✅ Multi-dimensional breakdowns (geo, device)

### To Enable Real Gemini AI

1. Open `src/services/gemini.ts`
2. Change `const USE_MOCK = true;` to `const USE_MOCK = false;`
3. Set your Google AI Studio API key:
   ```typescript
   const API_KEY = 'your-gemini-api-key-here';
   ```
4. Rebuild the application

Get your API key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

## 🗂️ Project Structure

```
media-net-2/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Modal.tsx
│   │   └── onboarding/
│   │       └── WelcomeModal.tsx
│   ├── contexts/
│   │   └── AppContext.tsx   # Global state management
│   ├── pages/
│   │   ├── CreateCampaign.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── anomaly.ts       # Anomaly detection logic
│   │   ├── gemini.ts        # Google AI integration
│   │   └── simulation.ts    # Data simulation engine
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── helpers.ts       # Utility functions
│   │   └── storage.ts       # Cookie storage layer
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🔧 Configuration

### Tailwind CSS
- Uses core utility classes only (no custom configuration)
- Includes custom font family setup for Inter and Fira Code
- Custom animations: `spin-slow`, `pulse-slow`

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` → `./src/*`)
- React JSX transform

### Cookie Storage
- 30-day expiration
- Automatic cleanup (keeps last 7 days of metric data)
- SameSite: Lax

## 📈 Data Model

### Campaigns
- Basic info (name, vertical, objective, budget)
- Targeting (geos, devices, placements)
- Monitoring configuration (enabled, sensitivity)
- Status (Active, Paused, Ended)

### Monitors
- 15 default metrics per campaign
- Types: Simple, Composite (N of M), Granular (dimensional)
- Configurable sensitivity thresholds

### Alarms
- Severity levels based on deviation magnitude
- AI-generated insights and recommendations
- State tracking (Active, Resolved, Dismissed)
- Financial impact estimation

### Metric Values
- Time-series data (hourly granularity)
- Multi-dimensional (overall + geo + device)
- Automatic retention (7 days)

## 🚨 Known Limitations

### Demo Mode Constraints
1. **No Real Data**: All metrics are simulated, not connected to actual ad platforms
2. **Single Browser**: Cookie storage limited to one browser/device
3. **Storage Limits**: ~4KB per cookie domain (approximately 7 days of data)
4. **No Real-Time Updates**: Manual refresh required to see new data
5. **Mock AI**: Insights are pre-generated patterns, not actual Gemini API calls (unless enabled)
6. **No Persistence**: Clearing cookies erases all data
7. **No Multi-User**: Designed for single-user demo purposes

### Future Enhancements
- Real API integration with ad platforms (Google Ads, Facebook Ads, etc.)
- Backend database (PostgreSQL, MongoDB)
- Real-time WebSocket updates
- Email/SMS notifications
- Multi-user support with authentication
- Advanced charting and visualizations
- Export reports (PDF, Excel)
- A/B test analysis
- Budget optimization recommendations
- Automated campaign adjustments

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Cookie Issues
```bash
# Open browser DevTools → Application → Cookies
# Delete cookies starting with "app_"
# Refresh the page
```

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3000
```

## 📝 License

This is a demo/prototype application for educational and demonstration purposes.

## 👨‍💻 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript strict mode
- ESLint with React plugin
- Consistent code formatting
- Comprehensive error handling

## 🤝 Support

For questions or issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure you're using Node.js 18+
4. Review the troubleshooting section

## 🎉 Acknowledgments

Built with:
- React Team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Google for the Gemini AI API
- Lucide for beautiful icons
- Recharts for charting capabilities

---

**Note**: This is a fully functional demo application. All data is simulated for demonstration purposes. For production use, integrate with actual ad platform APIs and implement proper backend infrastructure.
