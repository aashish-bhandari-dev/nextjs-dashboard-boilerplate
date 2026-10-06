"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  children,
  render,
  delay = 0,
  ...props
}: TooltipPrimitive.Trigger.Props) {
  if (!render && React.isValidElement(children)) {
    return <TooltipPrimitive.Trigger render={children} delay={delay} {...props} />;
  }
  return (
    <TooltipPrimitive.Trigger render={render} delay={delay} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipPortal({ ...props }: TooltipPrimitive.Portal.Props) {
  return <TooltipPrimitive.Portal data-slot="tooltip-portal" {...props} />;
}

function TooltipContent({
  className,
  side = "right",
  sideOffset = 8,
  align = "center",
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1.5 rounded-md shadow-md select-none pointer-events-none z-50 whitespace-nowrap",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
};
