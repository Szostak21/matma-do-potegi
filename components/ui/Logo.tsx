import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";

import { BRAND_ASSETS } from "@/lib/assets";
import { FOOTER } from "@/lib/content";
import { cn } from "@/lib/cn";

type LogoImageProps = {
  className?: string;
  priority?: boolean;
};

export function LogoImage({ className, priority }: LogoImageProps) {
  return (
    <Image
      src={BRAND_ASSETS.logo}
      alt={FOOTER.brand}
      width={1080}
      height={1080}
      className={cn("h-9 w-auto object-contain", className)}
      priority={priority}
    />
  );
}

type LogoLinkProps = LogoImageProps & {
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  linkClassName?: string;
};

export function LogoLink({
  className,
  linkClassName,
  priority,
  onClick,
}: LogoLinkProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", linkClassName)}
      onClick={onClick}
    >
      <LogoImage className={className} priority={priority} />
    </Link>
  );
}
