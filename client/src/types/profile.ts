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
