import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { LoadingState } from '@/components/ui/LoadingState'
import { Protected } from './routes/Protected'
import { ComingSoon } from '@/pages/ComingSoon'

const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))
const BlogList = lazy(() => import('@/pages/BlogList').then((m) => ({ default: m.BlogList })))
const BlogPostPage = lazy(() =>
  import('@/pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })),
)
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
)
const AdminPlaceholder = lazy(() =>
  import('@/pages/admin/AdminPlaceholder').then((m) => ({ default: m.AdminPlaceholder })),
)
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog').then((m) => ({ default: m.AdminBlog })))
const BlogEditor = lazy(() =>
  import('@/pages/admin/BlogEditor').then((m) => ({ default: m.BlogEditor })),
)
const AdminComments = lazy(() =>
  import('@/pages/admin/AdminComments').then((m) => ({ default: m.AdminComments })),
)
const AdminPortfolio = lazy(() =>
  import('@/pages/admin/AdminPortfolio').then((m) => ({ default: m.AdminPortfolio })),
)
const PortfolioEditor = lazy(() =>
  import('@/pages/admin/PortfolioEditor').then((m) => ({ default: m.PortfolioEditor })),
)
const AdminTestimonials = lazy(() =>
  import('@/pages/admin/AdminTestimonials').then((m) => ({ default: m.AdminTestimonials })),
)
const AdminInstagram = lazy(() =>
  import('@/pages/admin/AdminInstagram').then((m) => ({ default: m.AdminInstagram })),
)
const AdminContact = lazy(() =>
  import('@/pages/admin/AdminContact').then((m) => ({ default: m.AdminContact })),
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
      { path: '/blog', element: suspense(<BlogList />) },
      { path: '/blog/:slug', element: suspense(<BlogPostPage />) },
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
      { path: 'blog', element: <Protected>{suspense(<AdminBlog />)}</Protected> },
      { path: 'blog/new', element: <Protected>{suspense(<BlogEditor />)}</Protected> },
      { path: 'blog/:id', element: <Protected>{suspense(<BlogEditor />)}</Protected> },
      { path: 'portfolio', element: <Protected>{suspense(<AdminPortfolio />)}</Protected> },
      { path: 'portfolio/new', element: <Protected>{suspense(<PortfolioEditor />)}</Protected> },
      { path: 'portfolio/:id', element: <Protected>{suspense(<PortfolioEditor />)}</Protected> },
      { path: 'cases', element: adminSection('Estudos de Caso') },
      { path: 'cases/new', element: adminSection('Novo caso') },
      { path: 'cases/:id', element: adminSection('Editar caso') },
      { path: 'testimonials', element: <Protected>{suspense(<AdminTestimonials />)}</Protected> },
      { path: 'instagram', element: <Protected>{suspense(<AdminInstagram />)}</Protected> },
      { path: 'comments', element: <Protected>{suspense(<AdminComments />)}</Protected> },
      { path: 'contact', element: <Protected>{suspense(<AdminContact />)}</Protected> },
      { path: '*', element: suspense(<NotFound />) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
