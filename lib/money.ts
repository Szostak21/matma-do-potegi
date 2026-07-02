export function groszeToZl(grosze: number): string {
  return (grosze / 100).toFixed(2);
}

export function zlToGrosze(zl: number): number {
  return Math.round(zl * 100);
}

export function formatPln(grosze: number): string {
  return `${groszeToZl(grosze)} zł`;
}
