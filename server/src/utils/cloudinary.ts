import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/config";
import { AppError } from "./AppError";

export type ProfileImageKind = "avatar" | "cover";

interface UploadedImage {
  url: string;
}

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

export function uploadProfileImage(
  file: Express.Multer.File,
  kind: ProfileImageKind,
): Promise<UploadedImage> {
  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const upload = client.uploader.upload_stream(
      {
        folder: "devhub/profiles",
        resource_type: "image",
        public_id: `${kind}-${Date.now()}`,
        overwrite: false,
        transformation:
          kind === "avatar"
            ? [{ width: 512, height: 512, crop: "fill", gravity: "face" }]
            : [{ width: 1600, height: 500, crop: "fill", gravity: "auto" }],
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
