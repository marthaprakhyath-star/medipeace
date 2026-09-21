export type LookId = "moonlit" | "dawn" | "forest" | "zen";

export type Look = {
  id: LookId;
  name: string;
  blurb: string;
  image: string;
  scheme: "light" | "dark";
};

export const LOOKS: Look[] = [
  {
    id: "moonlit",
    name: "Moonlit Night",
    blurb: "Silver moon on a still lake.",
    image: "/looks/moonlit.jpg",
    scheme: "dark",
  },
  {
    id: "dawn",
    name: "Dawn Mist",
    blurb: "Peach fog and first light.",
    image: "/looks/dawn.jpg",
    scheme: "light",
  },
  {
    id: "forest",
    name: "Forest Canopy",
    blurb: "Moss, mist, and sunbeams.",
    image: "/looks/forest.jpg",
    scheme: "dark",
  },
  {
    id: "zen",
    name: "Desert Zen",
    blurb: "Raked sand and honey stone.",
    image: "/looks/zen.jpg",
    scheme: "light",
  },
];

export function getLook(id: string): Look {
  return LOOKS.find((l) => l.id === id) ?? LOOKS[0];
}
