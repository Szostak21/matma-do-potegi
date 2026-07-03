import { cn } from "@/lib/cn";

type HeroTile = {
  id: string;
  label: string;
  className: string;
};

const HERO_TILES: HeroTile[] = [
  {
    id: "tile-1",
    label: "Zajęcia grupowe",
    className: "bg-olive-200 h-48 lg:h-56",
  },
  {
    id: "tile-2",
    label: "Materiały autorskie",
    className: "bg-olive-300 h-56 lg:h-64",
  },
  {
    id: "tile-3",
    label: "Kameralna atmosfera",
    className: "bg-olive-100 h-52 lg:h-48",
  },
  {
    id: "tile-4",
    label: "Przygotowanie do matury",
    className: "bg-cream-deep h-48 lg:h-56",
  },
];

const MOBILE_TILE_SIZE = "h-56";

function HeroTile({
  tile,
  uniformMobileSize = false,
}: {
  tile: HeroTile;
  uniformMobileSize?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl shadow-soft ring-1 ring-ink/5",
        uniformMobileSize ? MOBILE_TILE_SIZE : tile.className,
      )}
      aria-label={tile.label}
    >
      <div className="absolute inset-0 flex items-end p-4">
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink/80 backdrop-blur-sm">
          {tile.label}
        </span>
      </div>
    </div>
  );
}

function HeroMobileMarqueeGroup({
  tiles,
  ariaHidden = false,
}: {
  tiles: HeroTile[];
  ariaHidden?: boolean;
}) {
  return (
    <div className="hero-marquee-group" aria-hidden={ariaHidden || undefined}>
      {tiles.map((tile) => (
        <div
          key={ariaHidden ? `${tile.id}-dup` : tile.id}
          className="w-64 shrink-0"
        >
          <HeroTile tile={tile} uniformMobileSize />
        </div>
      ))}
    </div>
  );
}

function HeroMobileMarquee() {
  return (
    <div className="min-w-0 lg:hidden">
      <div className="hero-marquee-viewport">
        <div className="hero-marquee-track">
          <HeroMobileMarqueeGroup tiles={HERO_TILES} />
          <HeroMobileMarqueeGroup tiles={HERO_TILES} ariaHidden />
        </div>
      </div>
    </div>
  );
}

export function HeroBentoGrid() {
  return (
    <>
      {/* Desktop: asymetryczny bento grid */}
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
