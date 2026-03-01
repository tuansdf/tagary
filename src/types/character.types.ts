export type Relationship =
  | "friend"
  | "colleague"
  | "sibling"
  | "parent"
  | "child"
  | "partner"
  | "classmate"
  | "other";

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  friend: "Friend",
  colleague: "Colleague",
  sibling: "Sibling",
  parent: "Parent",
  child: "Child",
  partner: "Partner",
  classmate: "Classmate",
  other: "Other",
};

export type Gender = "male" | "female" | "other";

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export interface Character {
  id: string;
  name: string;
  nickname?: string;
  relationship: Relationship;
  gender: Gender;
  avatar?: string;
  avatarDescription?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
