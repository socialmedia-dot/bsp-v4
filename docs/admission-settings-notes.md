# Admission Settings — Pending Requirements

## 1. Open Grades Auto-Display (from School Profile/CSV)
- **Current:** `allGrades` is hardcoded: `['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Sixth Form']`
- **Required:** Open Grades section in `/school/admissions` should auto-populate from each school's `gradesOffered` field
- **Source:** School profile data will come from CSV upload (contains basic info + performance data)
- **Note:** Each school has different grade ranges (e.g. some only Senior School from Year 9)
- **Action needed when CSV ready:** Replace hardcoded `allGrades` with dynamic read from school profile

## 2. Student Apply Form — Target Grade Removed
- **Done:** Target Grade / Year of Entry field removed from `/student/apply/[schoolId].vue`
- **Date:** June 2026
- **Reason:** User requested deletion; grade selection to be handled differently
