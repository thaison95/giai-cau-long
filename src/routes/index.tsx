import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12 md:px-6">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Giải cầu lông đồng đội</p>
    <h1 className="font-heading text-2xl font-bold md:text-3xl">Các giải đấu</h1>
    <p className="mt-3 text-sm text-muted-foreground">Các giải đấu công khai sẽ xuất hiện tại đây.</p>
  </main>
}
