import { cn } from './utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-700/40', className)}
      {...props}
    />
  )
}

export { Skeleton }
