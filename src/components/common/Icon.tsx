import type { LucideIcon, LucideProps } from "lucide-react";

const SIZE_MAP = {
  sm: 16,
  md: 18,
  lg: 20,
} as const;

interface IconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: keyof typeof SIZE_MAP;
}

export default function Icon({
  icon: IconComponent,
  size = "md",
  className,
  ...rest
}: IconProps) {
  const mergedClassName = className ? `shrink-0 ${className}` : "shrink-0";

  return (
    <IconComponent
      size={SIZE_MAP[size]}
      className={mergedClassName}
      aria-hidden="true"
      {...rest}
    />
  );
}
