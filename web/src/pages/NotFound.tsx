import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <>
      <Seo title="Página não encontrada — Projeto Sete" noindex path="/404" />
      <Container className="flex min-h-screen flex-col items-center justify-center text-center">
        <p className="eyebrow">Erro 404</p>
        <h1 className="mt-3 font-serif text-6xl">404</h1>
        <p className="mt-6 max-w-md text-smoke">
          A página que você procura não existe ou foi movida. Vamos voltar ao início.
        </p>
        <Button to="/" variant="primary" className="mt-8">
          Ir para o início
        </Button>
      </Container>
    </>
  )
}
