import { AppRouter } from '@/router'
import { Providers } from '@/providers/Providers'
import { MotionProvider } from '@/providers/MotionProvider'
import '@/styles/tailwind.css'

export function App() {
  return (
    <Providers>
      <MotionProvider>
        <AppRouter />
      </MotionProvider>
    </Providers>
  )
}
