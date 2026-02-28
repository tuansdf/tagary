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
  friend: "Bạn bè",
  colleague: "Đồng nghiệp",
  sibling: "Anh/Chị/Em",
  parent: "Bố/Mẹ",
  child: "Con",
  partner: "Người yêu",
  classmate: "Bạn cùng lớp",
  other: "Khác",
};

export type Gender = "male" | "female" | "other";

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
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
