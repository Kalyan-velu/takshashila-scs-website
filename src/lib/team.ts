import { getFacultyProfiles } from "@/lib/currentAffairs.ts";

export interface FacultyMember {
  slug: string;
  name: string;
  experience: string;
  expertise: string[];
  trackRecord: string;
  associations: string[];
  description: string;
  image: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let facultyPromise: Promise<FacultyMember[]> | null = null;

/** Faculty list, fetched from the Current Affairs API at build time. */
export function getFacultyList(): Promise<FacultyMember[]> {
  if (!facultyPromise) {
    facultyPromise = getFacultyProfiles().then((members) =>
      members.map((member) => ({
        slug: slugify(member.name),
        name: member.name,
        experience: member.experience,
        expertise: member.expertise,
        trackRecord: member.track_record,
        associations: member.associations,
        description: member.description,
        image: member.image,
      })),
    );
  }
  return facultyPromise;
}

export async function getFacultyBySlug(
  slug: string,
): Promise<FacultyMember | null> {
  const faculty = await getFacultyList();
  return faculty.find((member) => member.slug === slug) ?? null;
}
