import Image from "next/image";

import { HeroMobileMarquee } from "@/components/ui/HeroMobileMarquee";
import { cn } from "@/lib/cn";
import { IMAGE_ASSETS } from "@/lib/assets";

type HeroTile = {
  id: string;
  alt: string;
  src: string;
  className: string;
};

const HERO_IMAGE_SIZES = "(max-width: 1023px) 256px, 400px";

const HERO_TILES: HeroTile[] = [
  {
    id: "tile-1",
    alt: "Zajęcia grupowe z matematyki",
    src: IMAGE_ASSETS.hero.main,
    className: "h-48 lg:h-56",
  },
  {
    id: "tile-2",
    alt: "Zadania i arkusze maturalne",
    src: IMAGE_ASSETS.hero.exerciseCloseUp,
    className: "h-56 lg:h-64",
  },
  {
    id: "tile-3",
    alt: "Pomoce naukowe do nauki matematyki",
    src: IMAGE_ASSETS.hero.bookshelf,
    className: "h-52 lg:h-48",
  },
  {
    id: "tile-4",
    alt: "Indywidualne podejście na zajęciach",
    src: IMAGE_ASSETS.hero.closeUp,
    className: "h-48 lg:h-56",
  },
];

function HeroTile({ tile }: { tile: HeroTile }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl shadow-soft",
        tile.className,
      )}
    >
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        priority
        sizes={HERO_IMAGE_SIZES}
        className="object-cover"
      />
    </div>
  );
}

export function HeroBentoGrid() {
  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
        <div className="flex flex-col gap-4">
          <HeroTile tile={HERO_TILES[0]} />
          <HeroTile tile={HERO_TILES[2]} />
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <HeroTile tile={HERO_TILES[1]} />
          <HeroTile tile={HERO_TILES[3]} />
        </div>
      </div>

      <HeroMobileMarquee />
    </>
  );
}
