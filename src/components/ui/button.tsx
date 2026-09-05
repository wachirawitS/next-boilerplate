import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-slate-900 text-white hover:bg-slate-700", outline: "border border-slate-300 bg-white hover:bg-slate-50", link: "text-slate-700 underline-offset-4 hover:underline" } },
  defaultVariants: { variant: "default" },
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
