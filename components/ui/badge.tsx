import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white shadow-md shadow-slate-900/10",
        secondary: "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
        destructive: "border-transparent bg-rose-500 text-white shadow-md shadow-rose-500/20",
        outline: "text-foreground border-slate-200 bg-white",
        success: "border-transparent bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "border-transparent bg-amber-100 text-amber-700 border border-amber-200",
        info: "border-transparent bg-blue-100 text-blue-700 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
