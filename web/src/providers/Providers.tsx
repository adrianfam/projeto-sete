import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './AuthProvider'

/** Composição de providers raiz — ordem importa (de fora para dentro). */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <AuthProvider>{children}</AuthProvider>
    </HelmetProvider>
  )
}
