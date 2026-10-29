import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3 md:px-6">
        <Link to="/" className="font-heading text-sm font-bold text-foreground no-underline">GIẢI CẦU LÔNG</Link>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Link to="/r" className="text-foreground">Trọng tài</Link>
          <Link to="/admin" className="text-foreground">Ban tổ chức</Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
