import { useState } from "react";

const SEED_KEY = "recipe-browse-seed";
const SEED_DATE_KEY = "recipe-browse-seed-date";

function generateDailySeed(): string {
  const today = new Date().toDateString();

  const storedDate = sessionStorage.getItem(SEED_DATE_KEY);
  const storedSeed = sessionStorage.getItem(SEED_KEY);
  if (storedDate === today && storedSeed) return storedSeed;

  const newSeed = String(Math.random());
  sessionStorage.setItem(SEED_KEY, newSeed);
  sessionStorage.setItem(SEED_DATE_KEY, today);
  return newSeed;
}

// Stable for one calendar day so paginating a shuffled result set
// doesn't duplicate/skip rows within a session.
export function useSessionSeed(): string {
  const [seed] = useState(generateDailySeed);
  return seed;
}
