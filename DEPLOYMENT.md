# Deployment Guide

Step-by-step instructions for deploying the Campaign Anomaly Detection application.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
**Best for**: Instant deployment, automatic HTTPS, global CDN

```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy
vercel

# Follow prompts:
# - Project name: campaign-anomaly-detection
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

**Live in 60 seconds!** 🎉

Your app will be available at: `https://your-project.vercel.app`

---

### Option 2: Netlify
**Best for**: Easy setup, form handling, serverless functions

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Or use drag-and-drop:
# 1. Build: npm run build
# 2. Go to https://app.netlify.com/drop
# 3. Drag the 'dist' folder
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages
**Best for**: Free hosting, version control integration

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Update vite.config.ts:
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})

# Deploy
npm run deploy
```

**Enable GitHub Pages**:
1. Go to repository Settings
2. Pages → Source → gh-pages branch
3. Save

Live at: `https://yourusername.github.io/your-repo-name/`

---

### Option 4: AWS S3 + CloudFront
**Best for**: Enterprise deployment, full control

**Step 1: Build**
```bash
npm run build
```

**Step 2: Create S3 Bucket**
```bash
aws s3 mb s3://campaign-monitoring-app
aws s3 sync dist/ s3://campaign-monitoring-app --delete
```

**Step 3: Enable Static Website Hosting**
```bash
aws s3 website s3://campaign-monitoring-app \
  --index-document index.html \
  --error-document index.html
```

**Step 4: Set Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::campaign-monitoring-app/*"
  }]
}
```

**Step 5: CloudFront (Optional)**
- Create distribution
- Origin: S3 bucket URL
- Default root object: index.html
- Custom error response: 404 → /index.html (200)

---

### Option 5: Docker
**Best for**: Containerized deployment, cloud platforms

**Create `Dockerfile`**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create `nginx.conf`**:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build & Run**:
```bash
docker build -t campaign-monitoring .
docker run -p 80:80 campaign-monitoring
```

**Deploy to Cloud**:
```bash
# Docker Hub
docker tag campaign-monitoring yourusername/campaign-monitoring
docker push yourusername/campaign-monitoring

# Google Cloud Run
gcloud run deploy campaign-monitoring \
  --image yourusername/campaign-monitoring \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# AWS ECS, Azure Container Instances, etc.
```

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Configuration
```bash
# Create .env.production
VITE_GEMINI_API_KEY=your-production-api-key
VITE_USE_MOCK_AI=false
```

### 2. Build Optimization
```bash
# Test production build locally
npm run build
npm run preview

# Check output size
du -sh dist/
# Should be ~500KB - 1MB
```

### 3. Performance Audit
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun

# Target scores:
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >90
```

### 4. Security Headers
Add to your hosting platform:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 5. SSL/TLS
✅ All platforms provide automatic HTTPS
✅ Force redirect HTTP → HTTPS
✅ HSTS header recommended

---

## 📊 Production Monitoring

### Analytics Setup

**Google Analytics 4**:
```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Sentry Error Tracking**:
```bash
npm install @sentry/react

# In main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

---

## 🌍 Custom Domain Setup

### Vercel
```bash
# Add domain in Vercel dashboard
vercel domains add yourdomain.com

# Add DNS records (provided by Vercel)
# A record: 76.76.21.21
# CNAME: cname.vercel-dns.com
```

### Netlify
```bash
# Netlify dashboard → Domain settings → Add custom domain
# Update nameservers or add DNS records
```

### CloudFront
```bash
# Request SSL certificate in ACM
# Add alternate domain names to distribution
# Update Route 53 or your DNS provider
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**Create `.github/workflows/deploy.yml`**:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

**Set Secrets**:
1. GitHub repo → Settings → Secrets
2. Add: `GEMINI_API_KEY`, `VERCEL_TOKEN`, etc.

---

## 🧪 Staging Environment

**Create staging deployment**:
```bash
# Vercel
vercel --target staging

# Netlify
netlify deploy --alias staging

# Access at:
# https://staging-your-project.vercel.app
# https://staging--your-project.netlify.app
```

**Test checklist**:
- [ ] All pages load correctly
- [ ] Campaign creation works
- [ ] Alarms display properly
- [ ] AI insights generate
- [ ] Cookies persist across sessions
- [ ] Responsive on mobile/tablet
- [ ] No console errors

---

## 📦 Asset Optimization

### Image Optimization
```bash
# Install image optimizer
npm install -D vite-plugin-imagemin

# Add to vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9] },
    svgo: { plugins: [{ removeViewBox: false }] }
  })
]
```

### Font Optimization
Already included:
- Google Fonts with `display=swap`
- Preconnect to fonts.googleapis.com
- System font fallbacks

### Code Splitting
Vite automatically:
- Splits vendor code
- Lazy loads routes (if configured)
- Tree-shakes unused code

---

## 🔐 API Key Management

### Never Commit Keys!
```bash
# .gitignore should include:
.env
.env.local
.env.*.local
```

### Use Environment Variables
```bash
# Development
VITE_GEMINI_API_KEY=dev-key npm run dev

# Production (set in hosting platform)
# Vercel: Environment Variables dashboard
# Netlify: Site settings → Environment
# GitHub Actions: Repository secrets
```

### Rotation Strategy
1. Generate new API key
2. Add to all environments
3. Test deployment
4. Remove old key
5. Update documentation

---

## 📈 Performance Optimization

### Lazy Loading
```tsx
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Bundle Analysis
```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  visualizer({ open: true })
]

# Build and view report
npm run build
```

### Caching Strategy
```nginx
# Cache static assets (1 year)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

## 🛡️ Security Hardening

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data:;">
```

### Cookie Security
```typescript
// Update storage.ts for production
const COOKIE_OPTIONS = {
  expires: 30,
  sameSite: 'strict' as const,  // Stricter in production
  secure: true,  // HTTPS only
};
```

### API Rate Limiting
```typescript
// Implement in gemini.ts
const rateLimiter = {
  requests: 0,
  resetTime: Date.now() + 60000,

  async checkLimit() {
    if (Date.now() > this.resetTime) {
      this.requests = 0;
      this.resetTime = Date.now() + 60000;
    }

    if (this.requests >= 60) {
      throw new Error('Rate limit exceeded');
    }

    this.requests++;
  }
};
```

---

## 🐛 Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Check Node version
node --version  # Should be 18+

# Verbose build
npm run build -- --debug
```

### 404 on Routes
```
Issue: SPA routes don't work on refresh
Solution: Configure server redirects

# Vercel (vercel.json)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# Netlify (_redirects)
/*    /index.html   200

# nginx
try_files $uri $uri/ /index.html;
```

### Environment Variables Not Working
```bash
# Must start with VITE_
✅ VITE_API_KEY=xxx
❌ API_KEY=xxx

# Rebuild after changing .env
rm -rf dist
npm run build
```

### Large Bundle Size
```bash
# Analyze bundle
npm run build -- --mode production

# Check dist/ size
du -sh dist/

# Remove unused dependencies
npm prune
```

---

## 📞 Post-Deployment

### 1. Test Production URL
```bash
# Automated testing
npx @playwright/test

# Manual checklist:
- [ ] Homepage loads
- [ ] Create campaign works
- [ ] Alarms display
- [ ] Mobile responsive
- [ ] HTTPS enabled
```

### 2. Setup Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (GA4)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (Lighthouse CI)

### 3. Documentation
- [ ] Update README with live URL
- [ ] Document API keys used
- [ ] Create runbook for common issues

### 4. Backup
```bash
# Export initial state
curl https://your-app.com/ > backup.html

# Database backup (if added backend later)
```

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**
   - Check loading times
   - Review error rates
   - Analyze user behavior

2. **Iterate**
   - Collect user feedback
   - Fix bugs
   - Add features

3. **Scale**
   - Add backend (if needed)
   - Implement caching
   - Optimize queries

---

## ✅ Deployment Checklist

- [ ] Code builds successfully
- [ ] Tests pass
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] HTTPS enabled
- [ ] Custom domain (optional)
- [ ] Analytics installed
- [ ] Error tracking setup
- [ ] Security headers added
- [ ] Performance tested
- [ ] Mobile responsive verified
- [ ] Documentation updated

---

**Your app is now live! 🚀**

Monitor, iterate, and improve based on real user feedback.
