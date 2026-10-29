# 01 — Thiết kế database (Supabase / Postgres)

> Tài liệu dành cho AI agent triển khai. Làm **đúng theo tài liệu**, không tự thêm bảng/cột/tính năng. Nếu thấy mâu thuẫn, dừng lại và hỏi người dùng.

## 0. Phạm vi phiên bản 1

Giải cầu lông **đồng đội** kiểu Thomas/Uber Cup:
- Có vòng bảng (round-robin theo bảng) và vòng loại trực tiếp. Đối thủ vòng loại trực tiếp do ban tổ chức **nhập tay** (chưa tự động đi tiếp).
- Một **tie** (trận đồng đội, đội A gặp đội B) gồm nhiều **rubber** (trận đơn/đôi). Mặc định 5 rubber: đơn – đôi – đơn – đôi – đơn. Đội nào thắng 3 rubber trước thì thắng tie, các rubber còn lại bị bỏ (`skipped`).
- Một rubber đánh tối đa 3 game. Luật mặc định: chạm 21 điểm, hơn 2 điểm, tối đa 30 (29–29 thì điểm kế tiếp thắng).

**Ngoài phạm vi (không làm):** lưu lịch sử từng điểm, theo dõi giao cầu, tự động xếp nhánh, giải cá nhân, upload logo, thông báo email, đếm giờ.

### Thuật ngữ (dùng thống nhất trong code và tên bảng)

| Tiếng Việt | Tên trong DB/code |
|---|---|
| Giải đấu | `tournament` |
| Đội | `team` |
| Vận động viên | `player` |
| Bảng đấu | `group` (tên bảng SQL: `tournament_groups` vì `group` là từ khóa) |
| Trận đồng đội | `tie` |
| Trận (đơn/đôi) | `rubber` |
| Ván | `game` |
| Ban tổ chức | `organizer` |
| Trọng tài | `referee` |

## 1. Vai trò và cách xác thực

| Vai trò | Xác thực | Quyền |
|---|---|---|
| Khán giả | Không đăng nhập (role `anon`) | Chỉ xem giải đã công khai, xem realtime |
| Ban tổ chức | Supabase Auth (email magic link, tùy chọn Google). Nhiều người mỗi giải | Toàn quyền với giải của mình, kể cả chấm điểm mọi rubber |
| Trọng tài | **Không có tài khoản.** Dùng **link bí mật chứa token**: `/r/<token>` | Chỉ bắt đầu / ghi điểm / hoàn tác điểm / kết thúc rubber **được gán cho mình** |

Lý do dùng token thay vì tài khoản: trọng tài chỉ dùng tạm trong một giải, không muốn đăng ký. Ban tổ chức gửi link qua Zalo/Messenger. Khi giải kết thúc, xóa trọng tài thì token mất hiệu lực.

**Ý kiến về việc gán trọng tài:** đồng ý ban tổ chức gán trọng tài cho từng rubber trước khi bắt đầu (`rubbers.referee_id`). Ban tổ chức **không cần tự gán mình**, vì họ luôn có quyền chấm mọi rubber. Có tiện ích "gán một trọng tài cho tất cả rubber của một tie" ở phía giao diện (cập nhật hàng loạt).

## 2. Enum

```
tournament_status : 'draft' | 'published' | 'finished'
rubber_kind       : 'singles' | 'doubles'
tie_stage         : 'group' | 'knockout'
tie_status        : 'scheduled' | 'live' | 'finished'
rubber_status     : 'scheduled' | 'live' | 'finished' | 'skipped'
side              : 'a' | 'b'
gender            : 'm' | 'f'
rubber_end_reason : 'normal' | 'retired' | 'walkover'
```

## 3. Bảng

Quy ước chung: khóa chính `id uuid default gen_random_uuid()`; mọi bảng con có cột **`tournament_id`** (không chuẩn hóa chủ ý, để viết RLS đơn giản và để Realtime lọc theo `tournament_id`); `created_at timestamptz default now()`. Mọi FK `tournament_id` có `on delete cascade`.

### 3.1 `tournaments`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | uuid PK | |
| slug | text unique not null | Dùng trong URL công khai `/t/<slug>`. Chỉ `a-z0-9-` |
| name | text not null | |
| description | text | |
| venue | text | Địa điểm |
| start_date, end_date | date | |
| status | tournament_status default 'draft' | `draft` chỉ ban tổ chức thấy |
| created_by | uuid → auth.users not null | |
| rule_points_to_win | int default 21 | |
| rule_points_cap | int default 30 | |
| rule_games_to_win | int default 2 | Thắng 2 game thì thắng rubber |
| rule_rubbers_to_win_tie | int default 3 | |
| rule_tie_win_points | int default 1 | Điểm bảng cho đội thắng tie |
| rubber_template | rubber_kind[] default `{singles,doubles,singles,doubles,singles}` | Cấu trúc rubber của mỗi tie |

Check: `rule_points_cap >= rule_points_to_win`; `array_length(rubber_template,1) >= 1`.

### 3.2 `tournament_organizers`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| tournament_id | uuid FK | |
| user_id | uuid → auth.users | |
| email | text | Sao chép để hiển thị, không cần join `auth.users` |

PK `(tournament_id, user_id)`.
- Trigger `AFTER INSERT ON tournaments`: tự thêm `created_by` vào bảng này.
- Trigger `BEFORE DELETE`: chặn xóa organizer cuối cùng của giải.

### 3.3 `tournament_groups` (bảng đấu)

`id`, `tournament_id`, `name` (vd "Bảng A"), `sort_order int default 0`.

### 3.4 `teams`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id, tournament_id | | |
| name | text not null | |
| short_name | text not null | Tối đa 4 ký tự, vd "VIE" |
| flag_emoji | text | Tùy chọn, vd "🇻🇳" |
| group_id | uuid FK `tournament_groups` null | `on delete set null` |
| seed | int | Tùy chọn |

Unique `(tournament_id, short_name)`.

### 3.5 `players`

`id`, `tournament_id`, `team_id` (FK cascade), `full_name`, `gender` (nullable), `sort_order`.

### 3.6 `ties`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id, tournament_id | | |
| stage | tie_stage not null | |
| group_id | uuid FK null | Chỉ dùng khi `stage='group'` |
| round_label | text not null | "Bảng A – Lượt 1", "Tứ kết"… |
| round_order | int default 0 | Để sắp xếp |
| team_a_id, team_b_id | uuid FK `teams` **nullable** | Null = chưa xác định (vòng loại trực tiếp) |
| scheduled_at | timestamptz | |
| court | text | Tùy chọn |
| status | tie_status default 'scheduled' | **Chỉ do hệ thống cập nhật** |
| rubbers_won_a, rubbers_won_b | int default 0 | **Chỉ do hệ thống cập nhật** |
| winner_team_id | uuid FK null | **Chỉ do hệ thống cập nhật** |

Check: `team_a_id <> team_b_id`.

Trigger `AFTER INSERT ON ties`: tạo sẵn các rubber theo `tournaments.rubber_template` (`position` từ 1, `kind` theo template, trạng thái `scheduled`).
Cho phép `team_a_id`/`team_b_id` null lúc tạo; **không được bắt đầu rubber nếu tie chưa đủ hai đội**.

### 3.7 `rubbers`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id, tournament_id | | |
| tie_id | uuid FK cascade | |
| position | int not null | 1..N, unique `(tie_id, position)` |
| kind | rubber_kind | |
| referee_id | uuid FK `referees` null | `on delete set null` |
| court | text | Tùy chọn |
| scheduled_at | timestamptz | |
| status | rubber_status default 'scheduled' | **Hệ thống** |
| current_game | int default 1 | **Hệ thống** — số thứ tự game đang đánh |
| games_won_a, games_won_b | int default 0 | **Hệ thống** |
| winner_side | side null | **Hệ thống** |
| end_reason | rubber_end_reason null | **Hệ thống** |
| started_at, ended_at | timestamptz null | **Hệ thống** |

### 3.8 `rubber_players` (đội hình cho từng rubber)

`id`, `tournament_id`, `rubber_id` (FK cascade), `side`, `player_id` (FK cascade).
Unique `(rubber_id, player_id)`.
Ràng buộc (trigger): người chơi phải thuộc đội đúng phía (`side='a'` → `ties.team_a_id`); số người mỗi phía tối đa 1 (singles) hoặc 2 (doubles).
Ban tổ chức nhập; khán giả xem được.

### 3.9 `games`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id, tournament_id | | |
| tie_id | uuid FK | Chuẩn hóa ngược, để Realtime lọc theo tie |
| rubber_id | uuid FK cascade | |
| game_no | int | 1..3, unique `(rubber_id, game_no)` |
| score_a, score_b | int default 0 | |
| winner_side | side null | |

Chỉ hệ thống ghi. Game 1 được tạo khi bắt đầu rubber, game kế tiếp được tạo khi game trước kết thúc.

### 3.10 `referees` (công khai tên)

`id`, `tournament_id`, `name text not null`.
Khán giả được đọc (để hiển thị "Trọng tài: Nguyễn A").

### 3.11 `referee_tokens` (**bí mật**)

| Cột | Kiểu |
|---|---|
| referee_id | uuid PK FK `referees` cascade |
| token | text unique not null |

Token sinh bằng trigger `AFTER INSERT ON referees`: 24 byte ngẫu nhiên (`gen_random_bytes(24)`), mã hóa base64url (thay `+` `/` và bỏ `=`). **Chỉ ban tổ chức đọc được bảng này. Tuyệt đối không cho `anon` đọc.**

### 3.12 View `group_standings`

Tính từ `ties` đã `finished` với `stage='group'`, mỗi đội mỗi bảng một dòng:
`tournament_id, group_id, team_id, played, won, lost, points (= won * rule_tie_win_points), rubbers_for, rubbers_against, games_diff, points_diff`.
Sắp xếp: `points desc, rubbers_for - rubbers_against desc, games_diff desc, points_diff desc`. Đối đầu trực tiếp: **không làm trong v1**. Tạo view `with (security_invoker = true)`.

## 4. Quyền truy cập (RLS)

Bật RLS cho **mọi** bảng. Hàm trợ giúp (`security definer`, `set search_path = public`, `stable`):

- `is_organizer(p_tournament_id uuid) → boolean`: `auth.uid()` có trong `tournament_organizers`.
- `is_tournament_visible(p_tournament_id uuid) → boolean`: giải có `status <> 'draft'` **hoặc** `is_organizer(...)`.

### Ma trận quyền

| Bảng | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| tournaments | `status <> 'draft'` hoặc organizer | INSERT: user đăng nhập với `created_by = auth.uid()`. UPDATE/DELETE: organizer |
| tournament_organizers | Organizer của giải | INSERT: chỉ qua RPC `add_organizer_by_email`. DELETE: organizer |
| tournament_groups, teams, players, rubber_players | `is_tournament_visible` | Organizer |
| ties | `is_tournament_visible` | Organizer (xem giới hạn cột bên dưới) |
| rubbers | `is_tournament_visible` | UPDATE: organizer (giới hạn cột). INSERT/DELETE: không ai (chỉ trigger) |
| games | `is_tournament_visible` | **Không ai** (chỉ RPC) |
| referees | `is_tournament_visible` | Organizer |
| referee_tokens | **Chỉ organizer** | Không ai (chỉ trigger) |

### Giới hạn cột (bắt buộc)

RLS không giới hạn được cột, nên dùng `REVOKE UPDATE` toàn bảng rồi `GRANT UPDATE (cột...)` cho role `authenticated`:
- `ties`: chỉ được sửa `stage, group_id, round_label, round_order, team_a_id, team_b_id, scheduled_at, court`.
- `rubbers`: chỉ được sửa `referee_id, court, scheduled_at`.
- Các cột "Hệ thống" **không bao giờ** được sửa trực tiếp từ client.

Role `anon` chỉ có `SELECT` trên các bảng công khai và `EXECUTE` trên các RPC dành cho trọng tài. Không `GRANT` gì khác.

## 5. RPC (Postgres function)

Mọi hàm là `security definer`, `set search_path = public`, và **tự kiểm tra quyền bên trong**. Tên tham số bắt đầu bằng `p_`.

### 5.1 Hàm chấm điểm (dùng cho trọng tài và ban tổ chức)

Tham số chung: `p_token text default null`. **Quy tắc kiểm tra quyền** (hàm nội bộ `assert_can_score(p_rubber_id, p_token)`):
1. Nếu `auth.uid()` là organizer của giải chứa rubber → cho phép.
2. Ngược lại, nếu `p_token` khớp `referee_tokens.token` **và** `rubbers.referee_id` = referee đó **và** giải chưa `finished` → cho phép.
3. Còn lại → `raise exception 'forbidden'`.

Mọi hàm bắt đầu bằng `select ... from rubbers where id = p_rubber_id for update` để tránh ghi đè khi hai người cùng bấm.

| Hàm | Hành vi |
|---|---|
| `start_rubber(p_rubber_id, p_token)` | Yêu cầu: `status='scheduled'`; tie đủ hai đội; đội hình đủ (mỗi phía đủ người theo `kind`). Đặt `status='live'`, `started_at=now()`, `current_game=1`; tạo game 1; nếu tie đang `scheduled` thì chuyển tie sang `live` |
| `score_point(p_rubber_id, p_side, p_token)` | Yêu cầu `status='live'`. Tăng điểm `p_side` của game hiện tại thêm 1. Nếu game kết thúc (xem công thức) → đặt `winner_side`, tăng `games_won_*`. Nếu `games_won_*` đạt `rule_games_to_win` → kết thúc rubber (`end_reason='normal'`) và gọi `recompute_tie`. Ngược lại tạo game kế tiếp, `current_game += 1` |
| `undo_point(p_rubber_id, p_side, p_token)` | Yêu cầu `status='live'`, điểm của `p_side` trong **game hiện tại** > 0. Giảm 1 điểm. Chỉ hoàn tác trong game hiện tại; không hoàn tác rubber đã kết thúc hay game đã xong |
| `end_rubber_early(p_rubber_id, p_winner_side, p_token)` | Dùng khi chấn thương hoặc bỏ cuộc. Yêu cầu `status='live'`. Đặt `status='finished'`, `winner_side`, `end_reason='retired'`, gọi `recompute_tie`. Điểm hiện tại giữ nguyên |
| `end_rubber_walkover(p_rubber_id, p_winner_side)` | **Chỉ organizer.** Rubber `scheduled` → `finished`, `end_reason='walkover'`, không có game |

**Công thức kết thúc game** (với `P = rule_points_to_win`, `C = rule_points_cap`):
`game xong ⇔ (max(a,b) >= P và |a−b| >= 2) hoặc max(a,b) = C`.
Ví dụ: 21–19 xong; 21–20 chưa; 29–29 thì điểm kế tiếp (30–29) xong.

`recompute_tie(p_tie_id)` (hàm nội bộ, **không** cấp EXECUTE cho anon/authenticated):
- Đếm số rubber `finished` mà mỗi phía thắng → cập nhật `ties.rubbers_won_a/b`.
- Nếu một phía đạt `rule_rubbers_to_win_tie`: `ties.status='finished'`, `winner_team_id`, các rubber còn `scheduled` → `skipped`.
- Ngược lại nếu mọi rubber đều đã `finished`/`skipped` (trường hợp hiếm) → `finished`.

### 5.2 Hàm cho ban tổ chức

| Hàm | Hành vi |
|---|---|
| `add_organizer_by_email(p_tournament_id, p_email)` | Chỉ organizer gọi. Tìm user theo email trong `auth.users`. Không thấy → lỗi `user_not_found` (người đó phải đăng ký trước). Thêm vào `tournament_organizers` |
| `finish_tournament(p_tournament_id)` | Chỉ organizer. Đặt `status='finished'` và **xóa toàn bộ `referees`** của giải (token bị xóa theo, `rubbers.referee_id` thành null) |

### 5.3 Hàm cho trọng tài

| Hàm | Hành vi |
|---|---|
| `referee_whoami(p_token)` | Trả `referee_id, name, tournament_id` hoặc lỗi `invalid_token` nếu sai token hoặc giải đã kết thúc. Grant cho `anon` |

Trang trọng tài: gọi `referee_whoami`, rồi đọc `rubbers` có `referee_id = <id đó>` (bảng công khai, đọc bình thường) để hiển thị danh sách rubber được giao.

## 6. Realtime

```sql
alter publication supabase_realtime add table ties, rubbers, games;
```
- Client dùng `postgres_changes`, lọc bằng cột: `ties` và `rubbers` lọc theo `tournament_id`/`tie_id`; `games` lọc theo `tie_id`.
- Vì `anon` có `SELECT` công khai, khán giả không đăng nhập vẫn nhận được sự kiện.
- Khi nhận sự kiện: cập nhật cache TanStack Query bằng `setQueryData`; khi mất kết nối rồi nối lại hoặc tab được focus lại thì **refetch toàn bộ**, vì sự kiện có thể bị bỏ lỡ.

## 7. Index

`ties(tournament_id, round_order)`, `ties(group_id)`, `rubbers(tie_id, position)`, `rubbers(referee_id)`, `games(rubber_id, game_no)`, `games(tie_id)`, `teams(tournament_id)`, `players(team_id)`, `rubber_players(rubber_id)`, `referee_tokens(token)` (unique đã đủ), `tournaments(slug)` (unique đã đủ).

## 8. Quản lý migration

- Dùng Supabase CLI: thư mục `supabase/migrations/`, mỗi thay đổi là một file SQL có timestamp. Không sửa trực tiếp trên dashboard.
- Thứ tự: enum → bảng → trigger → hàm trợ giúp → RLS và grant → RPC → publication → view.
- Sinh type TypeScript: `supabase gen types typescript` vào `src/lib/database.types.ts`, dùng cho client.

## 9. Kiểm thử bắt buộc (viết bằng SQL hoặc pgTAP)

1. Anon đọc được giải `published`, **không** đọc được giải `draft`.
2. Anon **không** đọc được `referee_tokens`; **không** `UPDATE` được bảng nào; **không** `INSERT` được `games`.
3. Organizer A không sửa được dữ liệu giải của organizer B.
4. Trọng tài với token đúng chấm được rubber **được giao**, bị từ chối với rubber không được giao.
5. Sau `finish_tournament`, token cũ trả về `invalid_token`.
6. Chuỗi điểm 21–19, 19–21, 21–20(chưa xong) → 22–20: rubber kết thúc 2–1 đúng; 29–29 → 30–29 xong game.
7. Tie kết thúc ngay khi một đội thắng 3 rubber; các rubber còn lại thành `skipped`.
8. Hai lần `score_point` đồng thời cho cùng rubber đều được ghi nhận (không mất điểm).

## 10. Việc cần làm khi triển khai (checklist)

- [ ] Tạo project Supabase, bật Auth Email (magic link). Tắt "Confirm email" chỉ khi dev.
- [ ] Viết migration theo thứ tự ở mục 8.
- [ ] `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. **Không đưa `service_role` key vào frontend hoặc repo.**
- [ ] Chạy bộ kiểm thử mục 9 trước khi làm giao diện.
