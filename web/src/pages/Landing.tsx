import { Seo } from '@/components/seo/Seo'
import { Hero } from '@/features/hero/Hero'
import { About } from '@/features/about/About'
import { Portfolio } from '@/features/portfolio/Portfolio'
import { CaseStudies } from '@/features/caseStudies/CaseStudies'
import { Testimonials } from '@/features/testimonials/Testimonials'
import { Facility } from '@/features/facility/Facility'
import { InstagramGallery } from '@/features/instagram/InstagramGallery'
import { BlogPreview } from '@/features/blog/BlogPreview'
import { Contact } from '@/features/contact/Contact'

export function Landing() {
  return (
    <>
      <Seo />
      <Hero />
      <About />
      <Portfolio />
      <CaseStudies />
      <Testimonials />
      <Facility />
      <InstagramGallery />
      <BlogPreview />
      <Contact />
    </>
  )
}
