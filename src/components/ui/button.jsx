import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 disabled:pointer-events-none disabled:opacity-40 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20',
        outline:
          'border border-gold-500/40 text-gold-400 bg-transparent hover:bg-gold-500/10 hover:border-gold-400',
        secondary:
          'bg-slate-700/60 text-slate-200 hover:bg-slate-700 border border-slate-600/50',
        ghost:
          'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100',
        link:
          'text-gold-400 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
