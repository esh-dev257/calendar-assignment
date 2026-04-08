// Hero images per month - Unsplash, thematic to season.
// 0=Jan ... 11=Dec
export const HERO_IMAGES = [
  // Jan - snowy mountain
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=1200",
  // Feb - frosted forest
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200",
  // Mar - early spring blossoms
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200",
  // Apr - cherry blossoms
  "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200",
  // May - wildflower meadow
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200",
  // Jun - coastal cliffs
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
  // Jul - ocean
  "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1200",
  // Aug - desert dunes
  "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200",
  // Sep - golden fields
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200",
  // Oct - autumn forest
  "https://images.unsplash.com/photo-1507783548227-544c3b8fc065?auto=format&fit=crop&w=1200",
  // Nov - misty woods
  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1200",
  // Dec - winter pines
  "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200",
];

export function heroFor(month) {
  return HERO_IMAGES[month];
}
