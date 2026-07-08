import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { LoadingState } from '@/components/ui/LoadingState'
import { Protected } from './routes/Protected'
import { ComingSoon } from '@/pages/ComingSoon'

const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
)
const AdminPlaceholder = lazy(() =>
  import('@/pages/admin/AdminPlaceholder').then((m) => ({ default: m.AdminPlaceholder })),
)

const suspense = (el: React.ReactNode) => <Suspense fallback={<LoadingState />}>{el}</Suspense>

const adminSection = (title: string) => (
  <Protected>{suspense(<AdminPlaceholder title={title} />)}</Protected>
)

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: suspense(<Landing />) },
      { path: '/portfolio', element: suspense(<ComingSoon title="Portfólio" path="/portfolio" />) },
      { path: '/portfolio/:slug', element: suspense(<ComingSoon title="Projeto" path="/portfolio/x" />) },
      { path: '/cases/:slug', element: suspense(<ComingSoon title="Estudo de Caso" path="/cases/x" />) },
      { path: '/blog', element: suspense(<ComingSoon title="Blog" path="/blog" />) },
      { path: '/blog/:slug', element: suspense(<ComingSoon title="Artigo" path="/blog/x" />) },
      { path: '/sobre', element: suspense(<ComingSoon title="Sobre a Projeto Sete" path="/sobre" />) },
      { path: '/contato', element: suspense(<ComingSoon title="Contato" path="/contato" />) },
      { path: '*', element: suspense(<NotFound />) },
    ],
  },
  { path: '/admin/login', element: suspense(<AdminLogin />) },
  {
    path: '/admin',
    element: <Protected>{suspense(<AdminLayout />)}</Protected>,
    children: [
      { index: true, element: <Protected>{suspense(<AdminDashboard />)}</Protected> },
      { path: 'dashboard', element: <Protected>{suspense(<AdminDashboard />)}</Protected> },
      { path: 'blog', element: adminSection('Blog') },
      { path: 'blog/new', element: adminSection('Novo post') },
      { path: 'blog/:id', element: adminSection('Editar post') },
      { path: 'portfolio', element: adminSection('Portfólio') },
      { path: 'portfolio/new', element: adminSection('Novo item') },
      { path: 'portfolio/:id', element: adminSection('Editar item') },
      { path: 'cases', element: adminSection('Estudos de Caso') },
      { path: 'cases/new', element: adminSection('Novo caso') },
      { path: 'cases/:id', element: adminSection('Editar caso') },
      { path: 'testimonials', element: adminSection('Depoimentos') },
      { path: 'instagram', element: adminSection('Instagram') },
      { path: 'comments', element: adminSection('Comentários') },
      { path: 'contact', element: adminSection('Atendimento') },
      { path: '*', element: suspense(<NotFound />) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
