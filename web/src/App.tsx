import { AppRouter } from '@/router'
import { MotionProvider } from '@/providers/MotionProvider'
import '@/styles/tailwind.css'

export function App() {
  return (
    <MotionProvider>
      <AppRouter />
    </MotionProvider>
  )
}
