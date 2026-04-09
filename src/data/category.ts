export type Category = "ALL" | "APSC" | "UPSC" | "ADRE" | (string & {});
export const CATEGORIES: Category[] = ["ALL", "APSC", "UPSC", "ADRE"];

export const CATEGORY_MAP: Record<Category, string> = {
  ALL: "All",
  APSC: "APSC",
  UPSC: "UPSC",
  ADRE: "ADRE",
};
