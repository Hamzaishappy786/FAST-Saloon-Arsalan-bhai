import { cva } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gold-500/20 text-gold-300 border border-gold-500/30',
        booked: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        no_show: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
        available: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        taken: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        admin: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        secondary: 'bg-slate-700/60 text-slate-300 border border-slate-600/40',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
