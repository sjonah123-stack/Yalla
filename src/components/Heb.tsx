import type { ReactNode } from "react";

/** Hebrew inline text: the `heb` styling plus `lang="he"` so screen readers switch voice. */
export function Heb({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={("heb " + className).trim()} lang="he">
      {children}
    </span>
  );
}
