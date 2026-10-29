import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({ component: AdminHome })

function AdminHome() {
  return <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12 md:px-6"><h1 className="font-heading text-2xl font-bold">Ban tổ chức</h1><p className="mt-3 text-sm text-muted-foreground">Đăng nhập để quản lý các giải đấu của bạn.</p></main>
}
