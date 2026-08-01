import { model, Schema } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface IProfileExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface IProfileEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface IPortfolioProject {
  title: string;
  url: string;
  description?: string;
}

export interface IProfileSocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
}

export interface IProfile extends TimestampedEntity {
  user: Schema.Types.ObjectId;
  bio?: string;
  location?: string;
  skills: string[];
  experience: IProfileExperience[];
  education: IProfileEducation[];
  portfolio: IPortfolioProject[];
  socialLinks: IProfileSocialLinks;
  avatarUrl?: string;
  coverImageUrl?: string;
}

const experienceSchema = new Schema<IProfileExperience>(
  {
    company: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120 },
    startDate: { type: String, required: true },
    endDate: { type: String },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const educationSchema = new Schema<IProfileEducation>(
  {
    institution: { type: String, required: true, trim: true, maxlength: 160 },
    degree: { type: String, required: true, trim: true, maxlength: 120 },
    fieldOfStudy: { type: String, trim: true, maxlength: 120 },
    startDate: { type: String, required: true },
    endDate: { type: String },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const portfolioSchema = new Schema<IPortfolioProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    description: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const socialLinksSchema = new Schema<IProfileSocialLinks>(
  {
    github: { type: String, trim: true, maxlength: 2048 },
    twitter: { type: String, trim: true, maxlength: 2048 },
    linkedin: { type: String, trim: true, maxlength: 2048 },
  },
  { _id: false },
);

const profileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bio: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 120 },
    skills: { type: [String], default: [], maxlength: 30 },
    experience: { type: [experienceSchema], default: [], maxlength: 20 },
    education: { type: [educationSchema], default: [], maxlength: 10 },
    portfolio: { type: [portfolioSchema], default: [], maxlength: 20 },
    socialLinks: { type: socialLinksSchema, default: {} },
    avatarUrl: { type: String, trim: true, maxlength: 2048 },
    coverImageUrl: { type: String, trim: true, maxlength: 2048 },
  },
  { timestamps: true },
);

// Supports the one-to-one profile lookup used by public and owner profile views.
profileSchema.index({ user: 1 }, { unique: true });

export const Profile = model<IProfile>("Profile", profileSchema);
