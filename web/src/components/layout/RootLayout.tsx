import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppFloat } from './WhatsAppFloat'

export function RootLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
