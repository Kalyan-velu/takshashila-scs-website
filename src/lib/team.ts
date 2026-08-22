import teamData from "@/data/team.json";

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

const faculty: FacultyMember[] = teamData.faculty.map((member) => ({
  slug: slugify(member.name),
  name: member.name,
  experience: member.experience,
  expertise: member.expertise,
  trackRecord: member.track_record,
  associations: member.associations,
  description: member.description,
  image: member.image,
}));

export function getFacultyList(): FacultyMember[] {
  return faculty;
}

export function getFacultyBySlug(slug: string): FacultyMember | null {
  return faculty.find((member) => member.slug === slug) ?? null;
}
