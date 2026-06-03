# BSP v4 Development Notes
*Last updated: 2026-06-04*

## Current Project Status

### ✅ Completed
- Public site pages: Home, Schools, Consultants, Search, News, Roadmap, Sitemap
- Payment page (`/payment`) with Stripe integration
- Registration/Login pages (`/register`, `/login`)
- School profile pages (`/school/[city]/[slug]`)
- Consultant profile pages (`/consultant/[city]/[slug]`)
- Business profile pages (`/business/[city]/[slug]`)
- Student Portal: Apply (`/student/apply/[schoolId]`), Login, Register
- BSP Admin Portal (`/BSP/*`):
  - Dashboard
  - New Account Applications
  - Users (School, Consultant, Personal, Staff)
  - Settings (Fees, Staff, Website)
  - Payments, Promo Codes
- Operations Portal (`/operations/*`):
  - Dashboard, Applications, Payments, Reports, Users
- Mobile sidebar + hamburger menu (header-integrated, global CSS unified)
- Roadmap page, Sitemap page

### ⚠️ Known Issues
- Operations Portal pages use duplicated scoped sidebar CSS (needs unification)
- `/school/`, `/consultant/`, `/business/` dynamic routes may need ISR/SSR for SEO

### 📋 Latest Deploy
- URL: https://bsp-v4.pages.dev
- Date: 2026-06-04

---

## Development Priority

### Phase 1: Operations Portal Polish
- Unify Operations Portal layout (extract duplicate sidebar CSS into shared styles)
- Enhance `/operations/users.vue` (currently basic, 247 lines)
- Add mobile responsive support to Operations pages

### Phase 2: BSP Admin Enhancements
- `/BSP/dashboard` — add analytics/widgets
- `/BSP/new-account-applications` — add bulk actions

### Phase 3: Public Site & Portal Features
- Consultant Portal (`/consultant/*`) — profile management, leads
- School Portal (`/school/*`) — profile management, enquiries
- Business Portal (`/business/*`) — profile management

### Phase 4: Application Progress ⏳ LAST
- **Reason:** Linked to ALL account users (Personal, School, Consultant, BSP Staff)
- Student application tracking (`/student/applications` — basic version exists)
- School application management
- Consultant application pipeline
- Cross-portal unified progress view
- Notifications & status updates

---

## Resources
- Cloudflare Account ID: 5ed625224e853f3339f49db5068641c8
- UK Education API: https://api.education.gov.uk/statistics
