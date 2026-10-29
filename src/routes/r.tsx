import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/r')({ component: RefereeHome })

function RefereeHome() {
  return <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12 md:px-6"><h1 className="font-heading text-2xl font-bold">Trọng tài</h1><p className="mt-3 text-sm text-muted-foreground">Mở đường dẫn bí mật được ban tổ chức cung cấp để xem các trận được giao.</p></main>
}
