# BSP v3 — 版本 Sitemap

> 記錄所有已完成嘅 BSP v3 Cloudflare Pages 部署版本
> 最後更新：2026-04-29

---

## 📋 版本列表（由舊到新）

### 2026-04-19 — SEO 優化版本

| 版本 | URL | 內容 |
|------|-----|------|
| b0299e72 | https://b0299e72.bsp-v3.pages.dev | SEO 優化：Meta Tags、OG Image、JSON-LD、sitemap.xml、robots.txt |
| d8399411 | https://d8399411.bsp-v3.pages.dev/BSP/users/school | School Users 管理頁面 |
| e542d595 | https://e542d595.bsp-v3.pages.dev/BSP/users/personal | Personal Users 管理頁面（Edit/Suspend/Delete 按鈕修復） |

### 2026-04-20 — Payment + Dashboard

| 版本 | URL | 內容 |
|------|-----|------|
| 3dae3b2b | https://3dae3b2b.bsp-v3.pages.dev/payment | Payment Page 修復（移除雙 header、全部英文） |
| efaf159e | https://efaf159e.bsp-v3.pages.dev/BSP/dashboard | BSP Dashboard 新版面 |
| 87e88ed2 | https://87e88ed2.bsp-v3.pages.dev/payment | 舊版 Payment page（已廢） |

### 2026-04-21 — Staff + Agent 頁面

| 版本 | URL | 內容 |
|------|-----|------|
| 162c2f01 | https://162c2f01.bsp-v3.pages.dev/BSP/users/bspstaff | BSP Staff Users 管理頁面（overflow 修復） |
| f9afcdf5 | https://f9afcdf5.bsp-v3.pages.dev/BSP/users/consultant | Consultant Users 管理頁面 |

### 2026-04-22

| 版本 | URL | 內容 |
|------|-----|------|
| f45690f8 | https://f45690f8.bsp-v3.pages.dev | 最新版本 |

### 2026-04-28 — Schools 目錄 + Split View

| 版本 | URL | 內容 |
|------|-----|------|
| 36fd103f | https://36fd103f.bsp-v3.pages.dev | Schools 目錄頁面 |
| 60224647 | https://60224647.bsp-v3.pages.dev | Schools 目錄（3個版本：Grid / Map / Split）<br>Build: 81 routes |

### 2026-04-28 — Hour 30

| 版本 | URL | 狀態 |
|------|-----|------|
| **3fa9b5a9** ⬅️ | https://3fa9b5a9.bsp-v3.pages.dev | **Rollback 版本** |

### 2026-04-29 — Clean Header 統一版本 ⭐

|| 版本 | URL | GitHub Commit | 內容 |
||------|-----|---------------|------|
|| **42c7f611** | https://42c7f611.bsp-v3.pages.dev | [`07d4d0a`](https://github.com/socialmedia-dot/bsp-v3/commit/07d4d0a) | **統一 Header 設計**（所有頁面使用 consultants 風格）：白色背景、logo-bsp.jpg、Home / Schools / Consultants / Login |

### 2026-05-03 — Footer Sitemap 連結更新

|| 版本 | URL | 內容 |
||------|-----|------|
|| **d3d945aa** | https://d3d945aa.bsp-v3.pages.dev | Footer 加入 Sitemap 連結（default layout + 6 個獨立 footer 頁面）|

### 2026-05-13 — Fee Pause/Resume 放入 Edit Modal

| 版本 | URL | 內容 |
|------|-----|------|
| **4a80d3c2** ⭐ | https://4a80d3c2.bsp-v3.pages.dev | Fee 暫停/開啟放入 Edit Modal，儲存後才生效 |

### 2026-05-13 — Settings Pages + News 功能

| 版本 | URL | 內容 |
|------|-----|------|
| eb2db685 | https://eb2db685.bsp-v3.pages.dev | Fee pause/resume button、Settings 頁面（fees/staff/website）、News 頁面、HK News 頁面、Sitemap 更新 |

### 2026-05-03 — Sitemap 顯示進度更新

| 版本 | URL | 內容 |
|------|-----|------|
| **f8c67d49** | https://f8c67d49.bsp-v3.pages.dev | Sitemap 頁面重新設計，顯示所有規劃頁面及開發進度（17/42 頁完成，40%） |

---

## 🔄 當前狀態

- **目前部署版本：** `4a80d3c2.bsp-v3.pages.dev`（Fee 暫停/開啟放入 Edit Modal，儲存後才生效）
- **GitHub Repo：** https://github.com/socialmedia-dot/bsp-v3（`c363fe1`）
- **Workspace 程式碼：** `/home/ubuntu/workspace/data/projects/bsp-v3`

---

## 📊 待做工作（從 `development.md`）

- [ ] /faq 頁面
- [ ] /terms 頁面
- [ ] /privacy 頁面
- [ ] BSP Dashboard 審核申請頁面 (`/BSP/applications`)
- [ ] User categories 頁面
- [ ] Annual fee settings 頁面
- [ ] Stripe API Key 對接
- [ ] Email notification 系統

---

## 📌 已知問題

- `/school/harrow-international` 及其他 school profile 頁面未被 pre-render
  - 原因：CSR 動態 rendering，crawler 搵唔到 links
  - 解決：需要在 `nuxt.config.ts` 加入 route rules 強制 SSR

---

*此檔案由 SecrexAI 自動維護*
