# BSP v4 自動化開發計劃

## 目標
盡快完成剩餘 21 頁，每頁完成後自動部署並通知用戶 check。

## 剩餘工作清單（21 頁）

### Phase 1: Public + Operations（第 1 週）
| # | 頁面 | 路徑 | 頻佔 |
|---|------|-------|------|
| 1 | Schools Directory | /schools | WIP |
| 2 | School Profile (Public) | /school/:city/:slug | WIP |
| 3 | About BSP | /about | Planned |
| 4 | Contact Us | /contact | Planned |
| 5 | School Management | /operations/schools | Planned |
| 6 | Consultant Management | /operations/consultants | Planned |
| 7 | Operations Settings | /operations/settings | Planned |

### Phase 2: School Portal（第 2 週）
| # | 頁面 | 路徑 | 頻佔 |
|---|------|-------|------|
| 8 | School Login | /school/login | Planned |
| 9 | School Dashboard | /school/dashboard | Planned |
| 10 | Application Management | /school/applications | Planned |
| 11 | Application Detail | /school/applications/:id | Planned |
| 12 | School Profile (Portal) | /school/profile | Planned |
| 13 | Admissions Reports | /school/reports | Planned |

### Phase 3: Consultant Portal（第 3 週）
| # | 頁面 | 路徑 | 頻佔 |
|---|------|-------|------|
| 14 | Consultant Login | /consultant/login | Planned |
| 15 | Consultant Dashboard | /consultant/dashboard | Planned |
| 16 | Student List | /consultant/students | Planned |
| 17 | Student Detail | /consultant/students/:id | Planned |
| 18 | Consultant Profile | /consultant/profile | Planned |

### Phase 4: Legal + 收尾（第 4 週）
| # | 頁面 | 路徑 | 頻佔 |
|---|------|-------|------|
| 19 | FAQ | /faq | Planned |
| 20 | Terms of Service | /terms | Planned |
| 21 | Privacy Policy | /privacy | Planned |
| -- | Final Testing & Polish | -- | -- |

## 開發順序邏輯（依賴關係）
1. Public pages 先完成（其他 portal 可能要用到）
2. School Portal 和 Operations 擴充可并行
3. Consultant Portal 依賴 School Portal 完成
4. Legal 放最後

## 自動化 Workflow

### 每日週期
1. **01:00** — Daily Status Log（已設定）
2. **09:00** — 開發下一個 backlog item（如果上一個已被 approve）

### 每項任務流程
1. 自動開發頁面（delegate_task）
2. 自動 build（npm run generate）
3. 自動 deploy（wrangler pages deploy）
4. 喺 BSP development group 發送：
   > 「[Page Name] 已完成並部署：https://bsp-v4.pages.dev/[path]
   > 請 check，OK 話我繼續下一項」
5. 等待用戶於 DM 或 Group 回覆 "OK" 或修改意見
6. 收到 OK 後，記錄為完成，繼續下一項

### Gate 機制
- 每項完成後 **必須等用戶 approve**，不會自動繼續
- 用戶回覆後，才會啟動下一個開發週期
- 假期或用戶指定的 pause 日期可跳過

## 狀態追蹤
- 目前完成：36/57 頁（63%）
- 目標完成：57/57 頁（100%）
- 剩餘：21 頁

## 檢查方法
用戶可於任何時候要求：
- "查下進度" — 顯示完成百分比同剩餘項目
- "查下日誌" — 顯示最近開發日誌
- "查下下一項" — 顯示接下來做邊個
