# BSP v3 Development Notes
*Last updated: 2026-04-27*

## Current Project Status

### ✅ Completed
- School Users, Consultant Users, Personal Users, BSP Staff pages (CMS)
- New Account Applications page (CMS)
- Public Yellow Pages profile pages (3 types):
  - `pages/school/[city]/[slug].vue`
  - `pages/consultant/[city]/[slug].vue`
  - `pages/business/[city]/[slug].vue`
- Links updated from `/BSP/users/school/[id]` to `/school/[city]/[slug]` format

### ⚠️ Known Issues
- Empty `pages/school/city/` directory (fixed 'city' name) should be deleted
- Empty `pages/consultant/city/` directory
- Empty `pages/business/city/` directory

### 📋 Latest Deploy
- URL: https://be368c61.bsp-v3.pages.dev
- Date: 2026-04-27

---

## BSP Instructions (2026-04-27 16:38)

BSP said:
1. "Save current progress" - current build is the baseline
2. "Redesign from new direction" - easier, simpler, clearer for users
3. All old BSP website features will be ported over to new site
4. School performance data (CSV) will be uploaded later
5. UK Government API available (free, no auth): https://api.education.gov.uk/statistics
   - Covers KS2 (primary), KS4 (GCSE), KS5 (A-Level)
   - Query by school URN

### BSP Old Website Features to Preserve
- (TBD - BSP to list)

---

## Resources
- Cloudflare Account ID: 5ed625224e853f3339f49db5068641c8
- Cloudflare API Token: [REDACTED]
- UK Education API: https://api.education.gov.uk/statistics
