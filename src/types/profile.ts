export interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  badge?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SocialLink {
  platform: "github" | "blog" | "email" | "instagram" | "twitter";
  url: string;
}

export interface ProfileData {
  displayName: string;
  username?: string;
  role: string;
  bio: string;
  avatarText?: string;
  avatarUrl?: string | null;
  email: string;
  resumeUrl?: string | null;
  stacks: string[];
  links: LinkItem[];
  socials: SocialLink[];
}
