export const EVENT = {
  name: "Axe Games Celebration",
  date: "April 26, 2026 +",
  time: "3:00 PM",
  address: "23, 2015 32 Ave NE",
  addressShort: "23, 2015 32 Ave NE",
  activityTime: "4:00 PM – 5:00 PM",
  drinkFlavors: ["Lime", "Mango", "Grapefruit", "Surprise me"] as const,
};

export type DrinkFlavor = (typeof EVENT.drinkFlavors)[number];
