// src/lib/profile/profile.storage.ts
import type { UserProfile } from "@/types/userProfile";
import { userProfileGetMe } from "@/lib/api";

const KEY = "recommendation_user_profile_v1";

export function getProfileFromStorage(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfileToStorage(profile: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfileStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function isProfileCompleted(): boolean {
  const p = getProfileFromStorage();
  return !!(
    p &&
    p.year &&
    Array.isArray(p.interests) &&
    p.interests.length >= 3 &&
    Array.isArray(p.careerGoals) &&
    p.careerGoals.length >= 1
  );
}

/**
 * ✅ ดึง profile จาก backend แล้ว cache ลง localStorage
 * - return true ถ้า sync แล้ว profile "ครบ"
 * - ถ้า backend ไม่มี/ยังไม่กรอก -> return false
 */
export async function syncProfileFromApi(): Promise<boolean> {
  try {
    const remote = await userProfileGetMe();
    if (!remote) return false;

    // map ให้ตรงกับ type ใน frontend (year/interests/careerGoals)
    const now = new Date().toISOString();
    const profile: UserProfile = {
      year: remote.studyYear as 1 | 2 | 3 | 4,      
      interests: Array.isArray(remote.interests) ? remote.interests : [],
      careerGoals: Array.isArray(remote.careerGoals) ? remote.careerGoals : [],
      difficultyPreference: "medium", // ถ้าคุณตัด step3 ออก ก็ set ค่า default ได้
      learningStyle: "balanced",      // ถ้าคุณตัด step3 ออก ก็ set ค่า default ได้
      createdAt: remote.createdAt ?? now,
      updatedAt: remote.updatedAt ?? now,
    };

    saveProfileToStorage(profile);
    return !!(
      profile.year &&
      profile.interests.length >= 3 &&
      profile.careerGoals.length >= 1
    );
  } catch {
    return false;
  }
}

function userGetMyProfile() {
  throw new Error("Function not implemented.");
}
