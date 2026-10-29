# 02 — Design system & đặc tả giao diện

> Dành cho AI agent triển khai. Stack: React 19 + TanStack Router/Query + Tailwind CSS v4 + **shadcn/ui (preset `b3DpidP3hY`)**. Ngôn ngữ giao diện: **tiếng Việt**. Làm đúng token và quy tắc ở đây, không tự chọn màu/font khác.

## 0. Preset shadcn đang dùng

Preset https://ui.shadcn.com/create?preset=b3DpidP3hY giải mã ra cấu hình sau (đã kiểm chứng bằng cách chạy CLI):

| Mục | Giá trị |
|---|---|
| Style | `base-lyra` |
| Thư viện nền | **Base UI** (`@base-ui/react`), **không phải Radix** |
| Màu nền (baseColor) | `neutral` (xám trung tính) |
| Màu chủ đạo (primary) | Xanh ngọc lục bảo (emerald), `oklch(0.508 0.118 165.612)` ở chế độ sáng |
| Icon | `lucide-react` |
| Font chữ thường | **Inter Variable** (`@fontsource-variable/inter`) |
| Font tiêu đề | **JetBrains Mono Variable** (`@fontsource-variable/jetbrains-mono`) → biến `--font-heading` |
| Radius | `--radius: 0.625rem`, **nhưng style Lyra dùng góc vuông (`rounded-none`) cho nút và hầu hết component** |
| Mật độ | Gọn: chữ `text-xs`, nút cao 32px (`h-8`) |
| Dark mode | Class `.dark` trên `<html>` (`@custom-variant dark (&:is(.dark *))`) |

Cả Inter và JetBrains Mono đều có subset **vietnamese** nên hiển thị đúng tiếng Việt. Gói `@fontsource-variable/*` tự host (không gọi Google Fonts CDN).

Phong cách kết quả: vuông vức, gọn, tiêu đề đơn cách (monospace), giống bảng điểm kỹ thuật. Rất hợp để hiển thị tỉ số: chữ số monospace tự thẳng hàng.

### 0.1 Cài đặt vào project hiện tại

Chạy trong thư mục gốc project (cần mạng), **dùng `bunx`, không dùng `bun --bun`**:

```bash
bunx shadcn@latest init --preset b3DpidP3hY
```

Sau đó kiểm tra và dọn:
1. [src/styles.css](file:///Users/thaison/Projects/giai-cau-long/src/styles.css) sẽ được ghi đè bằng token của preset. **Xóa** mọi thứ còn sót của starter cũ: import Google Fonts (Fraunces/Manrope), biến `--sea-ink`, `--lagoon`…, các lớp hero/chip cũ, `@plugin "@tailwindcss/typography"` (nếu không dùng).
2. Xác nhận `components.json` có `"style": "base-lyra"`, `"iconLibrary": "lucide"`, `"css": "src/styles.css"`. Alias `@/*` → `src/*` **đã có sẵn** trong `tsconfig.json`; dùng `@/components/ui/...` và `@/lib/utils`.
3. Xác nhận file `src/components/ui/button.tsx` import `cn` từ `@/lib/utils` (không phải từ gói `cn` của npm); nếu CLI sinh import lạ thì sửa lại, và gỡ gói `cn` nếu nó bị thêm vào.
4. Thêm component khi cần bằng `bunx shadcn@latest add <tên>`; **không tự viết lại component đã có sẵn trong shadcn**.

### 0.2 Lưu ý quan trọng khi dùng Base UI (khác Radix)

- Không có `asChild`. Muốn nút/thẻ hiển thị như một liên kết, dùng prop **`render`**: `<Button render={<Link to="/admin" />}>Quản trị</Button>`.
- Component nằm trong `src/components/ui/` là **mã nguồn của dự án**: được phép sửa trực tiếp (ví dụ thêm size mới cho Button), nhưng giữ nguyên API.
- Trước khi dùng một component, đọc file của nó trong `src/components/ui/` để biết đúng props; không đoán theo tài liệu Radix.
- Dùng công cụ MCP `shadcn` (nếu có) hoặc `bunx shadcn@latest view <tên>` để xem mã chuẩn của component.

## 1. Nguyên tắc

1. **Mobile-first.** Khán giả xem trên điện thoại ở nhà thi đấu; trọng tài chấm điểm bằng một tay. Thiết kế cho 360px trước.
2. **Tỉ số là nhân vật chính.** Số điểm luôn là phần lớn nhất, đọc được từ xa, dùng `font-heading` (JetBrains Mono).
3. **Rõ trạng thái "trực tiếp".** Nhìn vào là biết trận nào đang diễn ra và dữ liệu có đang cập nhật không.
4. **Ít thao tác, chống bấm nhầm.** Màn trọng tài chỉ có vài nút to; hành động nguy hiểm phải xác nhận.
5. **Giữ phong cách Lyra:** góc vuông, viền mảnh, phẳng. Không gradient, không bóng đổ dày, không card lồng card, không bo tròn tùy tiện.

## 2. Token

Dùng **tên token chuẩn của shadcn** (`background`, `foreground`, `card`, `primary`, `muted`, `border`, `destructive`…). Chỉ thêm những token nghiệp vụ ở mục 2.2. Tuyệt đối không dùng mã màu hex/rgb trực tiếp trong component; luôn dùng class Tailwind theo token (`bg-primary`, `text-muted-foreground`, `bg-team-a/10`…).

### 2.1 Token của preset (giữ nguyên, không sửa)

`background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-*, sidebar-*, radius` — đúng như file `src/styles.css` do CLI sinh ra, cho cả `:root` (sáng) và `.dark` (tối).

Cách dùng:

| Nhu cầu | Token / class |
|---|---|
| Nền trang | `bg-background text-foreground` |
| Thẻ, panel | `bg-card text-card-foreground` + viền `border` |
| Chữ phụ | `text-muted-foreground` |
| Vùng nền phụ, hàng xen kẽ | `bg-muted` |
| Nút chính, liên kết, tab đang chọn | `primary` (xanh ngọc) |
| Xóa, lỗi | `destructive` |
| Thanh bên trang quản trị | `sidebar-*` (dùng component `Sidebar` của shadcn) |

### 2.2 Token nghiệp vụ cần thêm

Thêm vào `src/styles.css` (trong `:root` và `.dark`), rồi đăng ký trong `@theme inline` dạng `--color-team-a: var(--team-a);`… để dùng được `bg-team-a`, `text-live`…

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `--team-a` | `oklch(0.488 0.243 264)` (xanh dương) | `oklch(0.707 0.165 255)` | Phía/đội A |
| `--team-b` | `oklch(0.58 0.19 40)` (cam) | `oklch(0.76 0.15 55)` | Phía/đội B |
| `--live` | `oklch(0.577 0.245 27)` (đỏ) | `oklch(0.704 0.191 22)` | Nhãn TRỰC TIẾP, chấm nhấp nháy, viền rubber đang live |
| `--win` | `oklch(0.527 0.154 150)` (xanh lá) | `oklch(0.792 0.209 152)` | Bên thắng. **Luôn kèm icon dấu tích** vì gần màu primary |
| `--warning` | `oklch(0.555 0.163 48)` (hổ phách) | `oklch(0.828 0.189 84)` | Mất kết nối, thao tác cần chú ý |

Quy tắc:
- Đội A luôn **xanh dương**, đội B luôn **cam**, nhất quán toàn app. **Không chỉ dùng màu để phân biệt**: luôn kèm tên đội hoặc nhãn "A"/"B".
- `--live` chỉ dùng cho thứ đang diễn ra trực tiếp. Hành động xóa dùng `destructive`.
- Dùng nền nhạt `bg-team-a/10`, viền `border-team-a`, chữ `text-team-a`. Kiểm tra tương phản chữ/nền ≥ 4.5:1 (chữ lớn ≥ 3:1) ở cả hai chế độ.

### 2.3 Chữ

| Vai trò | Font | Class |
|---|---|---|
| Nội dung, nhãn, nút | Inter Variable | mặc định (`font-sans`) |
| Tiêu đề (h1, h2, tên giải/đội), **tất cả số điểm** | JetBrains Mono Variable | `font-heading` |

Số điểm và số liệu trong bảng: thêm `tabular-nums`.

| Cấp | Class gợi ý | Dùng cho |
|---|---|---|
| `display` | `font-heading font-bold tabular-nums text-7xl md:text-8xl leading-none` | Điểm trong màn trọng tài và trang trận |
| `score-lg` | `font-heading font-bold tabular-nums text-4xl leading-none` | Điểm trong `TieCard`, `RubberCard` |
| `h1` | `font-heading font-bold text-2xl md:text-3xl` | Tên giải |
| `h2` | `font-heading font-semibold text-lg md:text-xl` | Tiêu đề mục |
| `body` | `text-sm` (công khai và trọng tài: `text-base` trên mobile) | Nội dung |
| `small` | `text-xs text-muted-foreground` | Chú thích |
| `label` | `text-xs font-semibold uppercase tracking-wider` | Nhãn trạng thái (TRỰC TIẾP, KẾT THÚC) |

### 2.4 Mật độ và vùng chạm (điều chỉnh quan trọng so với preset)

Preset Lyra rất gọn (nút cao 32px, chữ 12px), **không đủ cho điện thoại**. Quy ước:

| Khu vực | Quy tắc |
|---|---|
| **Công khai** và **trọng tài** | Vùng chạm tối thiểu **44×44px**. Chữ nội dung tối thiểu `text-sm`; ô nhập liệu `text-base` trên mobile (tránh iOS tự phóng to) |
| **Quản trị** (desktop là chính) | Giữ mật độ gọn mặc định của preset. Trên mobile, nút hành động chính cũng phải đạt 44px |

Cách thực hiện: **sửa file `src/components/ui/button.tsx` và `input.tsx`** thêm biến thể kích thước, không tạo component mới:
- `Button` thêm size `touch` (`h-11 px-4 text-sm`), `xl` (`h-16 px-6 text-base`, dùng ở màn trọng tài).
- `Input`/`Select`: thêm class `h-11 text-base md:h-8 md:text-xs` cho trang công khai/trọng tài (hoặc size `touch`).

### 2.5 Khoảng cách, bố cục

- Thang khoảng cách của Tailwind (bội số 4px). Khoảng cách giữa các khối: `gap-6` (mobile), `gap-8` (≥ md).
- Nội dung rộng tối đa `max-w-5xl mx-auto`, padding ngang `px-4` (mobile), `md:px-6`.
- Góc: **giữ góc vuông của preset**. Chỉ dùng `rounded-full` cho chấm trạng thái.
- Bóng: không dùng. Phân tách bằng viền và nền `muted`.

### 2.6 Chuyển động

- Thời lượng 150ms (tương tác), 300ms (đổi số điểm). Preset đã có `tw-animate-css`.
- Khi điểm thay đổi: số **nháy sáng nền ~600ms** (nền `primary/20` rồi mờ dần).
- Chấm TRỰC TIẾP nhấp nháy chậm (1.5s). **Tôn trọng `prefers-reduced-motion`** (`motion-reduce:` của Tailwind): tắt nhấp nháy và nháy sáng.

## 3. Component

Nguồn: **ưu tiên dùng component shadcn có sẵn**, thêm bằng `bunx shadcn@latest add`. Chỉ viết component nghiệp vụ (mục 3.2) ở `src/components/`.

### 3.1 Component shadcn cần cài

`button, input, textarea, select, label, field, checkbox, switch, radio-group, badge, tabs, card, table, dialog, alert-dialog, drawer, sheet, sonner, skeleton, empty, separator, tooltip, dropdown-menu, sidebar, alert, spinner`.

Ánh xạ thay cho thiết kế cũ:

| Nhu cầu | Dùng |
|---|---|
| Thông báo ngắn | `sonner` (Toast) |
| Hộp thoại xác nhận (kết thúc giải, kết thúc sớm, xóa) | `alert-dialog` |
| Form trong hộp thoại | `dialog` trên desktop, `drawer` (kéo từ dưới lên) trên mobile |
| Menu điều hướng quản trị | `sidebar` (desktop); trên mobile dùng `sheet` hoặc thanh tab dưới cùng |
| Trạng thái trống | `empty` |
| Đang tải | `skeleton` đúng kích thước nội dung thật, `spinner` cho nút |
| Cảnh báo mất kết nối | `alert` |
| Nhãn trạng thái | `badge` (thêm biến thể `live`, `win`, `warning` bằng token ở 2.2) |

Mọi component tương tác phải có đủ trạng thái: mặc định, hover, focus-visible, active, disabled, loading. Preset đã lo hầu hết; component tự viết phải theo cùng cách (`focus-visible:ring-1 ring-ring/50`).

### 3.2 Component nghiệp vụ (tự viết, dựng từ component shadcn)

| Component | Mô tả |
|---|---|
| `LiveBadge` | `Badge` biến thể `live`: chấm đỏ nhấp nháy + chữ "TRỰC TIẾP" |
| `ConnectionStatus` | Ở trang trực tiếp: "Đang cập nhật trực tiếp" (chấm `primary`) / "Mất kết nối – đang thử lại…" (`alert` màu `warning`). Khi mất kết nối, **không xóa điểm đang hiển thị** |
| `TeamName` | Cờ emoji + tên đội; viền trái 3px màu `team-a`/`team-b`; chỗ hẹp dùng `short_name` |
| `ScoreBoard` | Hai cột A/B, điểm game hiện tại cỡ `display`, bên dưới chuỗi điểm các game đã xong (`21–18`, `19–21`) cỡ `small`, số game thắng. Bên thắng rubber tô `win` và có icon `Check` |
| `RubberCard` | `Card`: nhãn "Đơn 1/Đôi 1…", tên VĐV hai phía, `ScoreBoard` thu gọn, `Badge` trạng thái, tên trọng tài. Rubber `skipped`: mờ, gạch ngang, chú thích "Không thi đấu" |
| `TieCard` | `Card` bấm được (dùng `render={<Link/>}`): hai đội, tỉ số tie `3 – 1` cỡ `score-lg`, giờ/sân, `Badge` trạng thái |
| `StandingsTable` | Dựa trên `Table`. Cột: Hạng, Đội, Trận, Thắng, Thua, Điểm, HS rubber, HS game, HS điểm. Mobile: chỉ giữ Hạng, Đội, Trận, Thắng, Thua, Điểm; phần còn lại cuộn ngang |
| `LineupPicker` | Dựa trên `Select`: chọn VĐV cho từng phía của rubber; lọc theo đội; báo lỗi nếu thiếu người hoặc sai số lượng |
| `RefereeLinkCard` | Tên trọng tài, nút "Sao chép link", nút "Chia sẻ" (Web Share API nếu có), nút "Xóa" (qua `alert-dialog`). Không bao giờ hiển thị token trong danh sách công khai |

## 4. Bản đồ màn hình và route

Route theo file trong `src/routes/` (TanStack Router). Tách bố cục công khai, trọng tài, quản trị bằng route layout. **Xóa `src/routes/demo`, `about.tsx` và nội dung demo của Header/Footer của starter** (giữ lại cơ chế đổi sáng/tối nếu muốn, nhưng viết lại theo token mới).

### 4.1 Công khai (không đăng nhập)

| Route | Nội dung |
|---|---|
| `/` | Danh sách giải đã công khai: đang diễn ra trước, sau đó sắp tới, rồi đã kết thúc. Mỗi giải là một `Card` (tên, địa điểm, ngày, `LiveBadge` nếu có tie đang live) |
| `/t/$slug` | Trang giải với `Tabs`: **Trực tiếp** (mặc định nếu có tie live, ngược lại là Lịch đấu), **Lịch đấu** (nhóm theo ngày/vòng, `TieCard`), **Bảng xếp hạng** (mỗi bảng một `StandingsTable`), **Vòng loại trực tiếp** (danh sách `TieCard` theo `round_order`, chưa cần sơ đồ nhánh ở v1), **Đội** (danh sách đội và VĐV) |
| `/t/$slug/ties/$tieId` | Chi tiết tie: đầu trang là tỉ số tie cỡ lớn, bên dưới danh sách `RubberCard`. Realtime. Có `ConnectionStatus` |

### 4.2 Trọng tài (không đăng nhập, link bí mật)

| Route | Nội dung |
|---|---|
| `/r/$token` | Chào tên trọng tài, danh sách rubber được giao (sắp theo giờ); rubber đang `live` đứng đầu. Token sai hoặc giải đã kết thúc → màn "Link không còn hiệu lực" |
| `/r/$token/rubbers/$rubberId` | **Màn chấm điểm** (mục 5) |

### 4.3 Ban tổ chức (đăng nhập)

| Route | Nội dung |
|---|---|
| `/login` | Nhập email → nhận magic link. Thông báo rõ "Kiểm tra email của bạn" |
| `/admin` | Danh sách giải của tôi + nút "Tạo giải" |
| `/admin/tournaments/new` | Form tạo giải: tên, slug (tự gợi ý từ tên, kiểm tra trùng), địa điểm, ngày, luật (điền sẵn mặc định 21/30/thắng 2 game/thắng 3 rubber), mẫu rubber (5 ô chọn Đơn/Đôi) |
| `/admin/tournaments/$id` | Layout dùng `Sidebar`: **Tổng quan**, **Đội & VĐV**, **Bảng đấu**, **Lịch đấu**, **Trọng tài**, **Thành viên**, **Cài đặt** |
| `/admin/tournaments/$id/teams` | CRUD đội và VĐV (thêm nhanh nhiều VĐV bằng cách dán danh sách mỗi dòng một tên) |
| `/admin/tournaments/$id/groups` | Tạo bảng, xếp đội vào bảng |
| `/admin/tournaments/$id/ties` | Danh sách tie; tạo tie (giai đoạn, bảng, nhãn vòng, hai đội, giờ, sân); nút "Tạo tự động vòng tròn cho một bảng" (sinh mọi cặp trong bảng) |
| `/admin/tournaments/$id/ties/$tieId` | Soạn đội hình từng rubber (`LineupPicker`), gán trọng tài từng rubber (có nút "Gán cho tất cả"), chấm điểm thay (mở màn chấm điểm), xử thua/bỏ cuộc (`end_rubber_walkover`) |
| `/admin/tournaments/$id/referees` | Thêm trọng tài (chỉ nhập tên), `RefereeLinkCard`, xóa |
| `/admin/tournaments/$id/members` | Danh sách ban tổ chức + thêm bằng email (báo rõ nếu người đó chưa có tài khoản) |
| `/admin/tournaments/$id/settings` | Sửa thông tin giải, nút **Công khai giải** (`draft → published`, có xác nhận), nút **Kết thúc giải** (`alert-dialog`, nêu rõ "sẽ xóa tất cả trọng tài và link của họ") |

Mọi route `/admin/**` phải kiểm tra phiên đăng nhập, chưa đăng nhập thì chuyển về `/login`. Không dựa vào việc ẩn nút để bảo mật; bảo mật do RLS và RPC (xem `01-database-design.md`).

## 5. Màn chấm điểm của trọng tài (đặc tả chi tiết)

Dùng chung cho trọng tài (`/r/...`) và ban tổ chức. Chủ yếu cho điện thoại dọc; vẫn dùng được khi ngang. Áp dụng quy tắc vùng chạm lớn (mục 2.4).

**Bố cục từ trên xuống (mobile, không cần cuộn khi rubber đang live):**
1. Thanh trên cùng: nút quay lại, nhãn "Đơn 1 · Sân 2", `ConnectionStatus` thu gọn.
2. Hai **vùng điểm lớn** (mỗi vùng chiếm khoảng một phần tư chiều cao màn hình):
   - Nền `bg-team-a/10` / `bg-team-b/10`, viền `border-team-a` / `border-team-b`, tên đội/VĐV, **điểm cỡ `display`**.
   - **Chạm vào cả vùng = +1 điểm** cho phía đó (vùng chạm là toàn bộ thẻ, là một `<button>` thật).
3. Dòng chuỗi điểm các game đã xong và số game thắng (`Game 1: 21–18`).
4. Hai nút `Button` size `xl` variant `outline`: **"Hoàn tác điểm A"** và **"Hoàn tác điểm B"**; mỗi nút chỉ bật khi phía đó có điểm > 0 trong game hiện tại.
5. Nút nhỏ variant `destructive` ở cuối: **"Kết thúc sớm (bỏ cuộc/chấn thương)"** → `alert-dialog` chọn phía thắng và xác nhận.

**Trạng thái:**
- `scheduled`: chỉ hiển thị đội hình và nút `xl` **"Bắt đầu trận"**. Thiếu đội hình hoặc tie chưa đủ hai đội thì khóa nút và nói rõ lý do bằng chữ.
- `live`: như bố cục trên.
- `finished`: hiện kết quả cuối, không còn nút chấm điểm; có nút quay lại danh sách.

**Hành vi:**
- Mỗi lần chạm gọi RPC `score_point`; **cập nhật lạc quan** (hiện điểm ngay), nếu RPC lỗi thì hoàn lại và hiện toast lỗi.
- **Chống chạm đúp nhầm**: bỏ qua lần chạm thứ hai vào cùng vùng trong 250ms.
- Rung nhẹ (`navigator.vibrate(15)`) khi ghi điểm nếu thiết bị hỗ trợ.
- Khi game kết thúc: banner 3 giây "Game 1 thuộc về <đội>" rồi chuyển sang game kế. Khi rubber kết thúc: hiện màn kết quả.
- Giữ màn hình sáng (`navigator.wakeLock`) khi rubber `live`, nếu hỗ trợ.
- Mất kết nối: `alert` màu `warning` nổi bật "Mất kết nối – điểm có thể chưa được ghi". Không cho chạm tiếp khi chắc chắn offline.
- Khi rubber được cập nhật từ nơi khác (ban tổ chức chấm thay), màn hình tự cập nhật qua Realtime.

## 6. Trang tie công khai (đặc tả)

- Đầu trang: hai tên đội hai bên, tỉ số tie cỡ rất lớn ở giữa (`3 – 1`), `LiveBadge` nếu đang live, `ConnectionStatus`.
- Dưới: `RubberCard` theo `position`. Rubber `live` làm nổi (viền `border-live`), hiển thị điểm game hiện tại cỡ lớn; số điểm **nháy sáng** khi thay đổi.
- Tự cuộn tới rubber đang live khi mở trang (một lần, không giật khi cập nhật).
- Nếu tie chưa có hai đội: hiển thị "Chờ xác định đội".

## 7. Trạng thái trống, tải, lỗi (bắt buộc cho mọi màn)

| Tình huống | Hiển thị |
|---|---|
| Đang tải | `Skeleton` đúng hình dạng |
| Không có dữ liệu | `Empty` có hướng dẫn bước tiếp theo (ban tổ chức) hoặc thông báo trung tính (khán giả), ví dụ "Chưa có lịch đấu" |
| Không tìm thấy giải/tie | Trang 404 thân thiện có nút về trang chủ |
| Giải `draft` mà khán giả truy cập | Hiển thị như 404 (không tiết lộ giải tồn tại) |
| Lỗi mạng khi tải | Thông báo lỗi + nút "Thử lại" |
| Lỗi thao tác (RPC) | Toast lỗi tiếng Việt dễ hiểu; **không** hiển thị thông điệp lỗi thô của Postgres |

Ánh xạ lỗi RPC → câu tiếng Việt: `forbidden` → "Bạn không có quyền thực hiện thao tác này"; `invalid_token` → "Link không còn hiệu lực"; `user_not_found` → "Người dùng chưa có tài khoản. Hãy mời họ đăng ký trước".

## 8. Truy cập (a11y) và nội dung

- Mọi điều khiển dùng được bằng bàn phím; thứ tự Tab hợp lý; `focus-visible` rõ ràng (có sẵn trong preset).
- Điểm số thay đổi: vùng `aria-live="polite"` thông báo ngắn gọn kiểu "Đội A 12, đội B 10". Không thông báo mỗi nháy sáng.
- Icon đứng một mình phải có `aria-label`; hình trang trí dùng `aria-hidden`.
- Mọi bảng dùng `<table>` ngữ nghĩa (component `Table` của shadcn) với `<th scope>`.
- Ngày giờ theo `vi-VN`, múi giờ `Asia/Ho_Chi_Minh` (DB lưu UTC, hiển thị giờ địa phương).
- Giọng văn: ngắn, trực tiếp, gọi người dùng là "bạn". Nhãn nút là động từ ("Bắt đầu trận", "Lưu", "Sao chép link").

## 9. Hiệu năng

- Trang công khai phải dùng tốt trên 4G yếu: tách code theo route, không tải thư viện nặng không cần thiết.
- Chỉ subscribe Realtime ở trang cần; hủy subscribe khi rời trang.
- Chỉ import font cần thiết từ `@fontsource-variable/*`; không gọi font từ CDN.

## 10. Thứ tự triển khai gợi ý

1. Chạy `shadcn init` với preset (mục 0.1), dọn `styles.css`, thêm token nghiệp vụ (2.2), thêm size `touch`/`xl` (2.4), cài các component shadcn (3.1).
2. Supabase client, đăng nhập ban tổ chức, route guard `/admin`.
3. CRUD giải, đội, VĐV, bảng, tie (đã có test RLS ở file 01).
4. Trang công khai chỉ đọc (danh sách giải, lịch đấu, bảng xếp hạng, chi tiết tie).
5. Trọng tài: tạo link, `/r/$token`, màn chấm điểm.
6. Realtime (hook subscribe + cập nhật cache + `ConnectionStatus`).
7. Hoàn thiện trạng thái trống/lỗi, a11y, kiểm thử trên điện thoại thật.
