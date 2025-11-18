# Component Guide

Quick reference for all UI components in the application.

## 🎨 UI Components

### Button Component
**Location**: `src/components/ui/Button.tsx`

**Variants**:
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="danger">Delete</Button>
```

**Sizes**:
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

**Props**:
- `variant`: primary | secondary | outline | ghost | danger
- `size`: sm | md | lg
- `fullWidth`: boolean
- `disabled`: boolean
- All standard button HTML attributes

**Colors**:
- Primary: `bg-blue-600 hover:bg-blue-700`
- Secondary: `bg-gray-200 hover:bg-gray-300`
- Outline: `border-2 border-blue-600 text-blue-600`
- Ghost: `hover:bg-gray-100`
- Danger: `bg-red-600 hover:bg-red-700`

---

### Card Component
**Location**: `src/components/ui/Card.tsx`

**Basic Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

**With Hover**:
```tsx
<Card hover onClick={() => handleClick()}>
  Clickable card with hover effect
</Card>
```

**Props**:
- `padding`: none | sm | md | lg
- `hover`: boolean (adds scale + shadow on hover)
- `onClick`: function (makes card clickable)

**Subcomponents**:
- `CardHeader`: Header section with border
- `CardTitle`: Styled title text
- `CardContent`: Main content area

---

### Badge Component
**Location**: `src/components/ui/Badge.tsx`

**Severity Badges**:
```tsx
<Badge severity="CRITICAL">Critical</Badge>
<Badge severity="HIGH">High Priority</Badge>
<Badge severity="MEDIUM">Medium</Badge>
<Badge severity="LOW">Low Priority</Badge>
```

**State Badges**:
```tsx
<Badge state="ACTIVE">Active</Badge>
<Badge state="RESOLVED">Resolved</Badge>
<Badge state="DISMISSED">Dismissed</Badge>
```

**Sizes**:
```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

**Colors**:
- Critical: Red background (`bg-red-100 text-red-600`)
- High: Amber (`bg-amber-100 text-amber-600`)
- Medium: Yellow (`bg-yellow-100 text-yellow-600`)
- Low: Gray (`bg-gray-100 text-gray-600`)
- Active: Blue (`bg-blue-100 text-blue-600`)
- Resolved: Green (`bg-green-100 text-green-600`)

---

### Modal Component
**Location**: `src/components/ui/Modal.tsx`

**Basic Usage**:
```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader>
    <h2>Modal Title</h2>
  </ModalHeader>
  <ModalBody>
    Modal content here
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

**Sizes**:
```tsx
<Modal size="sm">Small Modal</Modal>
<Modal size="md">Medium (default)</Modal>
<Modal size="lg">Large Modal</Modal>
<Modal size="xl">Extra Large</Modal>
```

**Props**:
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `size`: sm | md | lg | xl
- `closeOnEscape`: boolean (default: true)

**Features**:
- Full-screen overlay with backdrop
- ESC key to close
- Body scroll lock when open
- Smooth fade-in animation

---

### LoadingSpinner Component
**Location**: `src/components/ui/LoadingSpinner.tsx`

**Basic Spinner**:
```tsx
<LoadingSpinner />
<LoadingSpinner size="sm" />
<LoadingSpinner size="lg" text="Loading..." />
```

**Full-Screen Overlay**:
```tsx
<LoadingOverlay text="Processing your request..." />
```

**Sizes**:
- `sm`: 16px
- `md`: 32px (default)
- `lg`: 48px

**Props**:
- `size`: sm | md | lg
- `text`: string (optional loading message)

---

## 📄 Page Components

### Dashboard
**Location**: `src/pages/Dashboard.tsx`

**Features**:
- Campaign summary cards
- Active alarms list
- Alarm detail modal with AI insights
- Empty states
- Refresh functionality

**Key Sections**:
1. **Status Summary**: 5 cards (Critical, High, Medium, Low, Healthy)
2. **Active Alarms**: Expandable alarm cards
3. **Alarm Details**: Modal with insights and recommendations

**State Management**:
- Uses `useApp()` context hook
- Auto-refreshes alarms on mount
- Tracks selected alarm for detail view

---

### CreateCampaign
**Location**: `src/pages/CreateCampaign.tsx`

**Features**:
- 3-step wizard with progress indicator
- Form validation
- Visual device/geo selection
- Sensitivity configuration

**Steps**:
1. **Basic Info**: Name, vertical, objective, budget, dates
2. **Targeting**: Devices and geographies
3. **Monitoring**: Enable monitoring and set sensitivity

**Form Fields**:
- Text inputs with validation
- Dropdown selects
- Date pickers
- Checkbox groups
- Radio button cards

**Validation Rules**:
- Name: Required, min 3 characters
- Budget: Required, > 0
- End date: Must be after start date
- At least 1 device selected
- At least 1 geo selected

---

## 🔄 Context & Hooks

### AppContext
**Location**: `src/contexts/AppContext.tsx`

**Usage**:
```tsx
import { useApp } from '@/contexts/AppContext';

function MyComponent() {
  const {
    campaigns,
    alarms,
    createCampaign,
    refreshAlarms,
    // ... other methods
  } = useApp();
}
```

**Provided State**:
- `campaigns`: Campaign[]
- `monitors`: Monitor[]
- `alarms`: Alarm[]
- `onboardingState`: OnboardingState
- `userPreferences`: UserPreferences

**Provided Methods**:
- `createCampaign(campaign)`: Create new campaign
- `updateCampaign(campaign)`: Update existing
- `deleteCampaign(id)`: Delete campaign
- `refreshAlarms()`: Re-evaluate all monitors
- `dismissAlarm(id)`: Dismiss an alarm
- `resolveAlarm(id, method)`: Mark alarm as resolved
- `applyRecommendation(alarmId, recommendation)`: Apply AI recommendation

---

## 🎭 Onboarding Components

### WelcomeModal
**Location**: `src/components/onboarding/WelcomeModal.tsx`

**Features**:
- Shown on first visit only
- Feature highlights with icons
- Getting started guide
- Demo mode notice

**Tracks State**:
- Sets `hasSeenWelcome: true` in cookies
- Prevents re-showing on subsequent visits

**Actions**:
- "Get Started" → Closes modal, navigate to create campaign
- "Close" → Just closes modal

---

## 🛠️ Utility Functions

### Helpers
**Location**: `src/utils/helpers.ts`

**Formatting**:
```tsx
formatCurrency(1250)          // "$1,250"
formatNumber(125000)          // "125,000"
formatPercent(2.5, 2)         // "2.50%"
formatMetricValue(2.5, '%')   // "2.50%"
formatDate('2025-01-15')      // "Jan 15, 2025"
formatDateTime('2025-01-15')  // "Jan 15, 2025 3:45 PM"
formatRelativeTime('2025-01-15') // "2 hours ago"
formatDuration(start, end)    // "6h 30m"
```

**Calculations**:
```tsx
calculateDeviation(current, expected)  // Returns percentage
isInAlarm(current, expected, 'Strict') // Boolean
calculateSeverity(deviationPercent)    // AlarmSeverity
```

**Styling**:
```tsx
getSeverityColor('CRITICAL')  // { bg, text, border }
getSensitivityThreshold('Strict') // 0.15 (±15%)
cn('class1', condition && 'class2')  // Conditional classes
```

---

## 🎨 Design Tokens

### Colors (Tailwind Classes)

**Primary**:
- `text-blue-600`, `bg-blue-600`, `border-blue-600`
- Hover: `hover:bg-blue-700`

**Severity**:
```
Critical:  bg-red-100    text-red-600    border-red-600
High:      bg-amber-100  text-amber-600  border-amber-500
Medium:    bg-yellow-100 text-yellow-600 border-yellow-500
Low:       bg-gray-100   text-gray-600   border-gray-500
Success:   bg-green-100  text-green-600  border-green-500
```

**Neutrals**:
```
Background:    bg-white
Surface:       bg-gray-50
Border:        border-gray-200
Text Primary:  text-gray-900
Text Secondary: text-gray-500
Text Tertiary:  text-gray-400
```

---

### Typography Classes

**Headings**:
```
Page Title:      text-3xl font-bold text-gray-900
Section Header:  text-2xl font-semibold text-gray-900
Card Title:      text-xl font-semibold text-gray-900
Subheading:      text-lg font-medium text-gray-700
```

**Body Text**:
```
Primary:   text-base text-gray-900
Secondary: text-sm text-gray-600
Tertiary:  text-xs text-gray-500
```

**Special**:
```
Metric Value: font-mono text-2xl font-bold
Error:        text-sm text-red-600
Success:      text-sm text-green-600
```

---

### Spacing

**Padding**:
```
Compact:  p-2  (8px)
Small:    p-4  (16px)
Medium:   p-6  (24px)
Large:    p-8  (32px)
XLarge:   p-12 (48px)
```

**Gaps** (Grid/Flex):
```
Tight:   gap-2 (8px)
Normal:  gap-4 (16px)
Relaxed: gap-6 (24px)
Loose:   gap-8 (32px)
```

**Margins**:
```
Small:  mb-2, mt-2
Medium: mb-4, mt-4
Large:  mb-6, mt-6
XLarge: mb-8, mt-8
```

---

### Border Radius

```
Small:    rounded     (4px)  - Buttons, inputs
Medium:   rounded-md  (6px)  - Small cards
Large:    rounded-lg  (8px)  - Large cards, modals
XLarge:   rounded-xl  (12px) - Feature cards
Full:     rounded-full       - Pills, avatars
```

---

### Shadows

```
Subtle:   shadow-sm   - Inputs, small cards
Card:     shadow      - Default cards
Elevated: shadow-md   - Hover states
Modal:    shadow-lg   - Modals, popovers
Hero:     shadow-xl   - Feature highlights
```

---

## 🎬 Animation Classes

**Transitions**:
```
Fast:   transition-all duration-150
Normal: transition-all duration-200
Slow:   transition-all duration-300
```

**Hover Effects**:
```
Scale:   hover:scale-105
Shadow:  hover:shadow-lg
Opacity: hover:opacity-80
```

**Loading States**:
```
Spin:       animate-spin
Pulse:      animate-pulse
Slow Spin:  animate-spin-slow
Slow Pulse: animate-pulse-slow
```

---

## 📱 Responsive Utilities

**Breakpoints**:
```
sm:  640px  - Mobile landscape
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Large desktop
```

**Common Patterns**:
```tsx
// Stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Full width mobile, fixed width desktop
<div className="w-full lg:w-96">

// Smaller padding on mobile
<div className="p-4 lg:p-8">
```

---

## 🔍 Usage Examples

### Creating a Status Card
```tsx
<Card padding="md" hover onClick={() => handleClick()}>
  <div className="flex items-center justify-between">
    <div>
      <Badge severity="CRITICAL">Critical</Badge>
      <h3 className="text-xl font-semibold mt-2">CTR Drop</h3>
      <p className="text-sm text-gray-500">Summer Sale Campaign</p>
    </div>
    <div className="text-4xl font-bold font-mono text-red-600">
      {formatPercent(1.2, 1)}
    </div>
  </div>
</Card>
```

### Creating a Form Section
```tsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Campaign Name
    </label>
    <input
      type="text"
      className="w-full px-4 py-2 border border-gray-300 rounded-md
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter campaign name"
    />
  </div>
</div>
```

### Creating an Alarm Card
```tsx
<Card padding="lg" className="border-l-4 border-red-600">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold">{alarm.metricName}</h3>
      <p className="text-sm text-gray-500">{alarm.campaignName}</p>
    </div>
    <Badge severity={alarm.severity}>{alarm.severity}</Badge>
  </div>

  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <span className="text-sm text-gray-500">Current</span>
      <p className="text-2xl font-mono font-bold text-red-600">
        {formatMetricValue(alarm.currentValue, '%')}
      </p>
    </div>
    <div>
      <span className="text-sm text-gray-500">Expected</span>
      <p className="text-2xl font-mono font-bold text-gray-700">
        {formatMetricValue(alarm.expectedValue, '%')}
      </p>
    </div>
  </div>

  <div className="flex gap-2">
    <Button size="sm" variant="primary">View Details</Button>
    <Button size="sm" variant="outline">Dismiss</Button>
  </div>
</Card>
```

---

## 💡 Best Practices

### Component Composition
```tsx
// ✅ Good: Compose small, reusable components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid: Large monolithic components
<LargeComponentWithEverything />
```

### Conditional Styling
```tsx
// ✅ Good: Use helper function
className={cn(
  'base-class',
  isActive && 'active-class',
  hasError && 'error-class'
)}

// ❌ Avoid: String concatenation
className={'base ' + (isActive ? 'active ' : '') + (hasError ? 'error' : '')}
```

### Loading States
```tsx
// ✅ Good: Show loading UI
{isLoading ? <LoadingSpinner /> : <Content />}

// ❌ Avoid: Leaving blank
{!isLoading && <Content />}
```

### Error Handling
```tsx
// ✅ Good: Show error message
{error && (
  <div className="text-red-600 text-sm mt-2">
    {error.message}
  </div>
)}

// ❌ Avoid: Silent failures
{error && null}
```

---

This guide covers all components in the application. Refer to individual source files for implementation details and additional props.
