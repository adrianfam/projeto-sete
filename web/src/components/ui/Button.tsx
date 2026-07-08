import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'link' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-500 ease-refined disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-brass text-charcoal px-6 py-3 hover:bg-brass-soft border border-brass hover:border-brass-soft',
  ghost:
    'border border-mist/50 text-ink px-6 py-3 hover:border-brass hover:text-brass',
  link: 'text-brass link-underline px-0 py-0',
  whatsapp:
    'bg-success text-paper px-6 py-3 hover:brightness-110 border border-success',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base px-8 py-4',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
type ButtonAsLink = CommonProps & { to: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
  >
type ButtonAsAnchor = CommonProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href'
  >

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonAsButton | ButtonAsLink | ButtonAsAnchor
>(function Button(props, _ref) {
  const { variant = 'primary', size = 'md', className, children } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  if ('to' in props && props.to) {
    const { to, className: _omit, variant: _v, size: _s, children: _c, ...rest } = props
    return (
      <Link to={to} className={classes} {...(rest as object)}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const { href, className: _omit, variant: _v, size: _s, children: _c, ...rest } = props
    return (
      <a href={href} className={classes} {...(rest as object)}>
        {children}
      </a>
    )
  }

  const { className: _omit, variant: _v, size: _s, children: _c, ...rest } =
    props as ButtonAsButton
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
})
