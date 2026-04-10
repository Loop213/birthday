import Wish from "../models/Wish.js";
import { generateShareSlug } from "../utils/generateShareSlug.js";

export async function createUniqueShareSlug() {
  let shareSlug = generateShareSlug();

  while (await Wish.exists({ shareSlug })) {
    shareSlug = generateShareSlug();
  }

  return shareSlug;
}
