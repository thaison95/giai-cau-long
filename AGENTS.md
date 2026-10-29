# giai-cau-long — Agent Context

Ứng dụng quản lý giải cầu lông đồng đội (kiểu Thomas/Uber Cup): khán giả xem tỉ số realtime, ban tổ chức quản lý giải, trọng tài chấm điểm bằng link bí mật.

## Tài liệu thiết kế (ĐỌC TRƯỚC KHI CODE)
- [docs/01-database-design.md](docs/01-database-design.md) — schema Supabase, RLS, RPC, Realtime, danh sách test bắt buộc.
- [docs/02-design-system.md](docs/02-design-system.md) — shadcn preset, token, component, route, đặc tả màn hình.

Làm đúng theo hai tài liệu này. Nếu thấy mâu thuẫn hoặc thiếu, **dừng lại và hỏi người dùng**, không tự thêm bảng/cột/tính năng.

## Quy tắc bắt buộc
- **Commit message phải viết bằng tiếng Anh** (tiêu đề ngắn dạng mệnh lệnh, phần mô tả nếu có cũng bằng tiếng Anh). Không viết commit message bằng tiếng Việt.

## Kiến trúc
- **SPA thuần** (TanStack Start ở chế độ `spa`, không SSR), deploy lên **Cloudflare Pages**. Không có code chạy phía server.
- Backend là **Supabase** (Postgres + Auth + Realtime), SPA gọi trực tiếp bằng `@supabase/supabase-js`. Bảo mật dựa vào **RLS và RPC** (xem file 01), không dựa vào việc ẩn UI.
- Ban tổ chức: Supabase Auth (magic link). Trọng tài: không có tài khoản, dùng link `/r/<token>`. Khán giả: không đăng nhập.
- Chỉ đưa `anon` key vào frontend. **Không bao giờ** đưa `service_role` key vào code hoặc repo.

## Stack
- React 19, TanStack Start + Router (file routes trong `src/routes`), TanStack Query (`src/integrations/tanstack-query`)
- Tailwind CSS v4 (`@tailwindcss/vite`), Vite 8
- **shadcn/ui** preset `b3DpidP3hY` (style `base-lyra`, nền **Base UI** chứ không phải Radix, icon lucide, font Inter + JetBrains Mono). Alias `@/*` → `src/*`.
- Bun để quản lý package; Biome (`bun run check | lint | format`)
- Supabase (chưa cài `@supabase/supabase-js` ở thời điểm viết)

## Lệnh
- `bun run dev` — dev server cổng 3000. **Không dùng `bun --bun run dev`**: ép Vite chạy bằng runtime Bun làm một số plugin lỗi (đã gặp `ECONNREFUSED` với plugin Cloudflare cũ). Chạy bằng Node là ổn định.
- `bun run build` — build SPA vào `dist/client` (có `index.html`). `dist/server` chỉ dùng lúc prerender shell, Pages không dùng.
- `bun run deploy` — build + `wrangler pages deploy` (cần `wrangler login`; lần đầu có thể phải `wrangler pages project create giaicaulong`).
- `bun run check` — Biome. Có thể báo lỗi định dạng ở file sinh ra; sửa bằng `bunx biome check --write`.
- Thêm component UI: `bunx shadcn@latest add <tên>`.

## Cloudflare Pages
- Project name: `giaicaulong` (xem `wrangler.jsonc`, `pages_build_output_dir: ./dist/client`).
- Nếu dùng Git integration của Pages: build command `bun run build`, output directory `dist/client`.
- `vite.config.ts` bật `tanstackStart({ spa: { enabled: true, prerender: { outputPath: '/index' } } })` để shell SPA xuất thành `index.html` (Pages dùng làm fallback cho mọi route). Đã bỏ `@cloudflare/vite-plugin`.
- `src/router.tsx` bọc `QueryClientProvider` qua `Wrap` (đã bỏ `react-router-ssr-query`).

## Biến môi trường
Biến phía client cần tiền tố `VITE_`. Đặt trong `.env.local` (đã bị gitignore) và trong cài đặt build của Pages:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Gotchas
- `routeTree.gen.ts` là file sinh tự động (`bun run generate-routes`); không sửa tay.
- Base UI không có `asChild`; dùng prop `render` (xem file 02, mục 0.2).
- Component trong `src/components/ui/` là mã nguồn của dự án và được phép sửa, nhưng phải đọc file trước khi dùng, không đoán API theo Radix.
- Chạy Intent CLI từ thư mục gốc project (cần `package.json`).
- Shell trong sandbox có thể bị `EPERM` khi ghi `node_modules/.vite-temp`; chạy build/dev ở shell thường.
- `src/routes/demo`, `about.tsx` và nội dung Header/Footer hiện vẫn là demo của starter, sẽ bị thay (file 02, mục 4).

## Lịch sử scaffold (tham khảo)
```
npx @tanstack/cli@latest create giai-cau-long --agent --package-manager bun --tailwind --deployment cloudflare --toolchain biome --add-ons tanstack-query
```
Đã chạy thêm `--framework React --non-interactive` để tránh prompt. `--tailwind` đã deprecated (Tailwind luôn bật). Không dùng `--blank` vì nó bỏ Tailwind/devtools. Sau đó project được chuyển từ Workers SSR sang SPA cho Pages.

TanStack Intent:
```
npx @tanstack/intent@latest install   # chỉ chạy được trong terminal tương tác
npx @tanstack/intent@latest list      # chạy từ thư mục gốc; từng tìm thấy 35 skill / 11 package
bunx --no-install --package @tanstack/intent intent load <package>#<skill>
```
`install` chưa hoàn tất (báo `intent.skills is not configured`); người dùng cần tự chạy `npx @tanstack/intent@latest install` trong terminal. Trước khi đổi kiến trúc lớn, nạp skill liên quan (vd `@tanstack/start-client-core#start-core/deployment`, `.../server-functions`, các skill `@tanstack/react-router`).

## Việc tiếp theo
1. Tạo project Supabase và cài Supabase CLI; viết migration theo file 01, chạy bộ test mục 9 của file 01.
2. `bunx shadcn@latest init --preset b3DpidP3hY` rồi dọn `src/styles.css` (file 02, mục 0.1).
3. Làm theo thứ tự triển khai ở file 02, mục 10.
4. Chạy `npx @tanstack/intent@latest install` trong terminal.
5. `wrangler login` rồi `bun run deploy`.
