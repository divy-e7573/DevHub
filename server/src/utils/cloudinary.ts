import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { config } from "../config/config";
import { AppError } from "./AppError";

export type ProfileImageKind = "avatar" | "cover";
export type ImageUploadKind = ProfileImageKind | "post";

interface UploadedImage {
  url: string;
}

interface UploadedRawFile { url: string }

function getCloudinary(): typeof cloudinary {
  const cloudinaryConfiguration = config.media.cloudinary;

  if (!cloudinaryConfiguration) {
    throw new AppError(
      "Image uploads are not configured.",
      503,
      "MEDIA_NOT_CONFIGURED",
    );
  }

  cloudinary.config(cloudinaryConfiguration);
  return cloudinary;
}

function uploadImage(
  file: Express.Multer.File,
  kind: ImageUploadKind,
): Promise<UploadedImage> {
  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const upload = client.uploader.upload_stream(
      {
        folder: kind === "post" ? "devhub/posts" : "devhub/profiles",
        resource_type: "image",
        public_id: `${kind}-${randomUUID()}`,
        overwrite: false,
        transformation:
          kind === "avatar"
            ? [{ width: 512, height: 512, crop: "fill", gravity: "face" }]
            : kind === "cover"
              ? [{ width: 1600, height: 500, crop: "fill", gravity: "auto" }]
              : [{ width: 1800, height: 1800, crop: "limit" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return an image URL."));
          return;
        }

        resolve({ url: result.secure_url });
      },
    );

    upload.end(file.buffer);
  });
}

export function uploadProfileImage(
  file: Express.Multer.File,
  kind: ProfileImageKind,
): Promise<UploadedImage> {
  return uploadImage(file, kind);
}

export async function uploadPostImages(
  files: Express.Multer.File[],
): Promise<string[]> {
  return Promise.all(files.map(async (file) => (await uploadImage(file, "post")).url));
}

export function uploadResume(file: Express.Multer.File): Promise<UploadedRawFile> {
  const client = getCloudinary();
  return new Promise((resolve, reject) => {
    const upload = client.uploader.upload_stream(
      { folder: "devhub/resumes", resource_type: "raw", public_id: `resume-${randomUUID()}`, overwrite: false },
      (error, result) => {
        if (error) { reject(error); return; }
        if (!result?.secure_url) { reject(new Error("Cloudinary did not return a resume URL.")); return; }
        resolve({ url: result.secure_url });
      },
    );
    upload.end(file.buffer);
  });
}
