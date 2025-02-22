
import { cn } from "@/lib/utils";

interface MaterialSymbolProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: string;
  fill?: boolean;
  weight?: number;
  grade?: number;
  size?: number;
  className?: string;
}

export function MaterialSymbol({
  icon,
  fill = false,
  weight = 400,
  grade = 0,
  size = 24,
  className,
  ...props
}: MaterialSymbolProps) {
  return (
    <span
      className={cn(
        "material-symbols-rounded",
        className
      )}
      style={{
        fontVariationSettings: `
          'FILL' ${fill ? 1 : 0},
          'wght' ${weight},
          'GRAD' ${grade},
          'opsz' ${size}
        `
      }}
      {...props}
    >
      {icon}
    </span>
  );
}
