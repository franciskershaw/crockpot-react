export interface ShowcaseRecipe {
  name: string;
  timeInMinutes: number;
  serves: number;
  imageUrl: string;
}

export const SHOWCASE_CARD_COUNT = 5;

// Production deletes a recipe's old Cloudinary photo when it's replaced or the recipe is deleted, so update this pool if that happens to one of these.
export const SHOWCASE_POOL: ShowcaseRecipe[] = [
  {
    name: "BBQ Pulled Pork",
    timeInMinutes: 320,
    serves: 12,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1685279568/Crockpot/janqirlyhsxmredsyo2p.png",
  },
  {
    name: "Sticky Honey Mustard Posh Dogs",
    timeInMinutes: 40,
    serves: 4,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1673368580/Crockpot/x97pzzehaok682tq3hfd.jpg",
  },
  {
    name: "Buffalo Fried Chicken Burgers with Pickles",
    timeInMinutes: 40,
    serves: 4,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1708016188/Crockpot/fshdyrhg3xxtolbjiszv.jpg",
  },
  {
    name: "Seafood Paella",
    timeInMinutes: 70,
    serves: 8,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1673367139/Crockpot/lxee5pweo1ztspcf8qs2.jpg",
  },
  {
    name: "Classic butter chicken",
    timeInMinutes: 100,
    serves: 4,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1779103203/recipes/file_zsfl0p.jpg",
  },
  {
    name: "Shakshuka traybake",
    timeInMinutes: 60,
    serves: 4,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1737975368/Crockpot/cdw5ycmula77cwwn5jet.jpg",
  },
  {
    name: "Natasha's Smash Burgers",
    timeInMinutes: 25,
    serves: 3,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1786734896/recipes/file_e4kiv1.jpg",
  },
  {
    name: "Toad in the hole",
    timeInMinutes: 120,
    serves: 4,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1745398262/Crockpot/vttluwyedkldl3rm9ifx.jpg",
  },
  {
    name: "Chicken And Chorizo Rice",
    timeInMinutes: 40,
    serves: 4,
    imageUrl:
      "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1673367713/Crockpot/b7sq9dffxna22x6okrku.jpg",
  },
];

export function pickShowcaseRecipes(): ShowcaseRecipe[] {
  const pool = [...SHOWCASE_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, SHOWCASE_CARD_COUNT);
}
