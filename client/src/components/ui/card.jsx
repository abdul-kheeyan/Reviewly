import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border border-gray-700 bg-gray-800 text-white shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";
