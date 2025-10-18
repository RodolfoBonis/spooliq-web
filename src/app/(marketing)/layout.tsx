import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-500">SpoolIQ</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Recursos
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Preços
            </Link>
            <Link href="#about" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Sobre
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary-500 hover:bg-primary-600">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-primary-500">SpoolIQ</span>
              <p className="text-sm text-neutral-600 mt-3">
                Plataforma completa para gerenciamento de orçamentos de impressão 3D
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Produto</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="#features" className="hover:text-neutral-900">Recursos</Link></li>
                <li><Link href="#pricing" className="hover:text-neutral-900">Preços</Link></li>
                <li><Link href="#" className="hover:text-neutral-900">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Empresa</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="#about" className="hover:text-neutral-900">Sobre</Link></li>
                <li><Link href="#" className="hover:text-neutral-900">Contato</Link></li>
                <li><Link href="#" className="hover:text-neutral-900">Suporte</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="#" className="hover:text-neutral-900">Termos de Uso</Link></li>
                <li><Link href="#" className="hover:text-neutral-900">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-neutral-900">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-sm text-neutral-600">
            © 2024 SpoolIQ. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

