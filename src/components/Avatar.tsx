import { getInitials } from "../utils/ui.ts";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 font-bold text-white shadow-md ring-2 ring-white ${SIZE_CLASS[size]} ${className}`}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
