import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-fg hover:opacity-90",
        secondary:
          "bg-surface text-fg border border-border hover:bg-card",
        ghost: "text-fg hover:bg-surface",
        outline:
          "border border-border bg-transparent text-fg hover:bg-surface",
        start:
          "bg-accent text-accent-fg hover:opacity-90",
        chip: "border border-border bg-card text-fg hover:bg-surface data-[active=true]:bg-accent data-[active=true]:text-accent-fg data-[active=true]:border-transparent",
      },
      size: {
        default: "h-11 rounded-md px-5 text-sm",
        sm: "h-9 rounded-sm px-3.5 text-sm",
        lg: "h-14 rounded-lg px-6",
        xl: "h-16 rounded-xl px-8",
        icon: "size-11 rounded-full",
        chip: "h-10 rounded-full px-4 text-sm",
      },
      pressable: {
        true: "active:not-disabled:scale-[0.96]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pressable: true,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, pressable, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, pressable, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
