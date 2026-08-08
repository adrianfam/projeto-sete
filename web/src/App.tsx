import { AppRouter } from '@/router'
import { Providers } from '@/providers/Providers'
import { MotionProvider } from '@/providers/MotionProvider'
import { UpdateBanner } from '@/components/pwa/UpdateBanner'
import '@/styles/tailwind.css'

export function App() {
  return (
    <Providers>
      <MotionProvider>
        <AppRouter />
        {/* Aviso de nova versão do PWA (visível em todo o app) */}
        <UpdateBanner />
      </MotionProvider>
    </Providers>
  )
}
