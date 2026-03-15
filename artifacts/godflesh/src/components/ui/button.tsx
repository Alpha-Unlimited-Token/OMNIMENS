import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_18px_rgba(210,190,255,0.28),0_0_40px_rgba(180,160,255,0.12)] hover:shadow-[0_0_28px_rgba(220,205,255,0.50),0_0_60px_rgba(200,180,255,0.22)] border border-white/20 hover:border-white/35 transition-all duration-300",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(210,190,255,0.18)] transition-all duration-300",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5",
      ghost: "hover:bg-white/5 hover:text-white transition-colors",
      link: "text-primary underline-offset-4 hover:underline",
      gold: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(56,210,220,0.25)] hover:shadow-[0_0_28px_rgba(56,210,220,0.45)] border border-accent/40 font-bold transition-all duration-300",
    };

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-md px-4 text-xs",
      lg: "h-14 rounded-md px-10 text-lg uppercase tracking-widest",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-display",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
