import { ProfilePage } from "@/features/profile/components/ProfilePage";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfilePage username={username} />;
}
