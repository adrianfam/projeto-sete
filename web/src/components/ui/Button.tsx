import { forwardRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'link' | 'whatsapp' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-500 ease-refined disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden'

const variants: Record<Variant, string> = {
  primary:
    'bg-brass text-ink px-6 py-3 hover:bg-brass-soft border border-brass hover:border-brass-soft hover:shadow-glow',
  secondary:
    'bg-teal text-paper px-6 py-3 hover:bg-teal-light border border-teal',
  ghost:
    'border border-white/10 text-mist px-6 py-3 hover:border-brass/40 hover:text-brass hover:bg-white/[0.03]',
  outline:
    'border border-brass/40 text-brass px-6 py-3 hover:bg-brass hover:text-ink hover:border-brass',
  link: 'text-brass link-underline px-0 py-0',
  whatsapp:
    'bg-success text-paper px-6 py-3 hover:brightness-110 border border-success',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base',
  lg: 'text-base px-8 py-4 text-lg',
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
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setRipple(null), 600)
  }

  const classes = cn(base, variants[variant], sizes[size], className)

  const RIPPLE = (
    <span
      className="absolute pointer-events-none rounded-full bg-white/20 animate-scale-in"
      style={{
        width: 100,
        height: 100,
        left: (ripple?.x ?? 0) - 50,
        top: (ripple?.y ?? 0) - 50,
        transform: 'scale(0)',
        animation: 'scale-in 0.6s ease-out forwards',
      }}
    />
  )

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
    <button className={classes} onClick={handleClick} {...rest}>
      {children}
      {ripple && RIPPLE}
    </button>
  )
})
