export interface ProfileExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ProfileEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface PortfolioProject {
  title: string;
  url: string;
  description?: string;
}

export interface ProfileSocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
}

export interface GitHubRepository {
  name: string;
  description?: string;
  url: string;
  stars: number;
  language?: string;
}

export interface GitHubProfile {
  username: string;
  profileUrl: string;
  avatarUrl?: string;
  followersCount: number;
  publicReposCount: number;
  totalStars: number;
  topLanguages: Array<{ name: string; bytes: number }>;
  repositories: GitHubRepository[];
  syncedAt: string;
}

export interface Profile {
  user: {
    id: string;
    name: string;
    username: string;
  };
  bio?: string;
  location?: string;
  skills: string[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  portfolio: PortfolioProject[];
  socialLinks: ProfileSocialLinks;
  avatarUrl?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  github?: GitHubProfile;
  resumeUrl?: string;
}

export interface UpdateProfileInput {
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: ProfileExperience[];
  education?: ProfileEducation[];
  portfolio?: PortfolioProject[];
  socialLinks?: ProfileSocialLinks;
}
