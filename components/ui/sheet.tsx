"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type SheetContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
}
const SheetContext = React.createContext<SheetContextValue | null>(null)

// Root (supports controlled & uncontrolled)
type SheetProps = React.PropsWithChildren<{
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (v: boolean) => void
}>

const Sheet: React.FC<SheetProps> = ({ defaultOpen = false, open, onOpenChange, children }) => {
  const isControlled = typeof open === "boolean"
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const currentOpen = isControlled ? (open as boolean) : uncontrolledOpen
  const setOpen = (v: boolean) => {
    if (isControlled) {
      onOpenChange?.(v)
    } else {
      setUncontrolledOpen(v)
    }
  }
  return <SheetContext.Provider value={{ open: currentOpen, setOpen }}>{children}</SheetContext.Provider>
}

// Trigger
type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
const SheetTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const ctx = React.useContext(SheetContext)
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onClick?.(e)
      ctx?.setOpen(true)
    }
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: (e: any) => {
          if (typeof (children as any).props?.onClick === 'function') (children as any).props.onClick(e)
          handleClick(e)
        },
        ...props,
      })
    }
    return (
      <button type="button" onClick={handleClick} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

// Close
type CloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
const SheetClose = React.forwardRef<HTMLButtonElement, CloseProps>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const ctx = React.useContext(SheetContext)
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onClick?.(e)
      ctx?.setOpen(false)
    }
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: (e: any) => {
          if (typeof (children as any).props?.onClick === 'function') (children as any).props.onClick(e)
          handleClick(e)
        },
        ...props,
      })
    }
    return (
      <button type="button" onClick={handleClick} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
SheetClose.displayName = "SheetClose"

// Portal
const SheetPortal: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  if (typeof window === "undefined") return null
  const container = document.body
  return ReactDOM.createPortal(children, container)
}

// Overlay
const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(SheetContext)
    if (!ctx?.open) return null
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      />
    )
  }
)
SheetOverlay.displayName = "SheetOverlay"

// Variants for content position
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

type SheetContentProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sheetVariants>
>

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const ctx = React.useContext(SheetContext)
    if (!ctx?.open) return null
    return (
      <SheetPortal>
        <SheetOverlay />
        <div ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
          {children}
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
