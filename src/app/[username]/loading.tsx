import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191f28] flex flex-col items-center">
      <ProfileSkeleton />
    </div>
  );
}
