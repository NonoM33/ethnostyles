# Plan: UI/UX Overhaul - Ethnostyles Profiler

## Overview
Transform the current basic dashboard into a polished, modern SaaS application with:
- Collapsible sidebar navigation
- Enriched dashboard pages
- Professional landing/sales page
- Guided onboarding flow

---

## Phase 1: Sidebar Navigation

### 1.1 Create Sidebar Component
**File:** `apps/web/src/components/Sidebar.tsx`
- Collapsible sidebar (expanded/collapsed state)
- Persist state in localStorage
- Icons + labels when expanded, icons only when collapsed
- Sections: Main, Teams, Analytics, Settings
- Active route highlighting
- User profile at bottom with logout

### 1.2 Update DashboardLayout
**File:** `apps/web/src/components/DashboardLayout.tsx`
- Replace header navigation with sidebar
- Main content area with proper margins
- Mobile: Bottom navigation or slide-out drawer
- Breadcrumbs for context

### Navigation Structure:
```
Dashboard (Home icon)
Campaigns (Users icon)
Teams (UserGroup icon)
Analytics (ChartBar icon) [admin only]
---
Settings (Cog icon)
Organization (Building icon)
```

---

## Phase 2: Enriched Dashboard Pages

### 2.1 Main Dashboard (`DashboardPage.tsx`)
Current: Basic stats cards
Add:
- Welcome banner with user name + quick actions
- Activity feed (recent completions, new campaigns)
- KPI trend sparklines (7-day mini charts)
- Quick action buttons (New Campaign, Invite Team)
- Upcoming/pending items section

### 2.2 Campaigns Page (`CampaignsPage.tsx`)
Current: Simple list
Add:
- Search and filter bar (status, date range, type)
- Grid/List view toggle
- Bulk actions (archive, export)
- Campaign status badges with colors
- Progress indicators (responses/invited)
- Quick preview on hover

### 2.3 Campaign Dashboard (`CampaignDashboardPage.tsx`)
Current: Stats + responses list
Add:
- Response funnel visualization
- Interactive mythe distribution chart (Chart.js or Recharts)
- Response timeline
- Export to PDF/CSV buttons
- Share link management
- Email reminder functionality

### 2.4 Analytics Page (`AnalyticsPage.tsx`)
Current: Basic tabs with data
Add:
- Interactive radar chart for culture map
- Animated progress bars for gap analysis
- Historical trend line chart
- Department/team breakdown
- Downloadable reports

### 2.5 Teams Pages
Current: Basic forms
Add:
- Team cards with member avatars
- Composition donut chart
- Recommendation cards with icons
- Team comparison view

---

## Phase 3: Landing/Sales Page

### 3.1 Create Public Layout
**File:** `apps/web/src/components/PublicLayout.tsx`
- Clean header with logo + Login/Register buttons
- Footer with links

### 3.2 Landing Page Sections
**File:** `apps/web/src/pages/LandingPage.tsx`

1. **Hero Section**
   - Headline: "Comprenez la culture de votre equipe"
   - Subheadline: Value proposition
   - CTA: "Commencer gratuitement"
   - Hero illustration/image

2. **Problem Section**
   - Pain points: cultural misalignment, team conflicts
   - Statistics/social proof

3. **Solution Section**
   - 8 Mythes methodology explanation
   - Visual representation

4. **Features Grid**
   - Profiling surveys
   - Team analytics
   - Recruitment fit
   - Management recommendations

5. **How It Works**
   - 3-step process with icons
   - Screenshot previews

6. **Social Proof**
   - Testimonials (placeholder)
   - Company logos (placeholder)

7. **Pricing Section**
   - Free tier features
   - Pro tier features
   - Enterprise contact

8. **CTA Section**
   - Final call to action
   - Newsletter signup

---

## Phase 4: Onboarding Flow

### 4.1 Onboarding Checklist Component
**File:** `apps/web/src/components/OnboardingChecklist.tsx`
- Floating card on dashboard
- Progress indicator
- Dismissible after completion
- Persist state per user

### 4.2 Checklist Items:
1. Complete your profile
2. Create your first campaign
3. Invite team members
4. View your first results
5. Explore analytics

### 4.3 Guided Tour (Optional)
- Tooltip-based walkthrough
- Highlight key features
- Skip option

### 4.4 Empty States
Update all list pages with helpful empty states:
- Illustration
- Explanation text
- Primary action button

---

## Phase 5: Polish & Details

### 5.1 Loading States
- Skeleton loaders for all data
- Smooth transitions

### 5.2 Animations
- Page transitions (Framer Motion)
- Card hover effects
- Button interactions

### 5.3 Responsive Design
- Mobile-first approach
- Touch-friendly targets
- Adaptive layouts

### 5.4 Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus states

---

## Implementation Order

1. **Sidebar Navigation** (foundation for all other work)
2. **Landing Page** (public-facing priority)
3. **Dashboard Enrichment** (main user experience)
4. **Onboarding Flow** (user retention)
5. **Polish & Details** (final touches)

---

## Files to Create/Modify

### New Files:
- `apps/web/src/components/Sidebar.tsx`
- `apps/web/src/components/PublicLayout.tsx`
- `apps/web/src/components/OnboardingChecklist.tsx`
- `apps/web/src/components/EmptyState.tsx`
- `apps/web/src/components/SkeletonLoader.tsx`
- `apps/web/src/pages/LandingPage.tsx`

### Modified Files:
- `apps/web/src/components/DashboardLayout.tsx`
- `apps/web/src/App.tsx` (add landing route)
- `apps/web/src/features/dashboard/DashboardPage.tsx`
- `apps/web/src/features/campaigns/CampaignsPage.tsx`
- `apps/web/src/features/campaigns/CampaignDashboardPage.tsx`
- `apps/web/src/features/analytics/AnalyticsPage.tsx`
- `apps/web/src/features/teams/TeamCampaignsPage.tsx`
- `apps/web/src/features/teams/TeamDashboardPage.tsx`

---

## Dependencies to Add
- `recharts` - For interactive charts
- `@heroicons/react` - Already installed, will use more icons
