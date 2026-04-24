export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  COURSE_IMAGES: "course-images",
  LESSON_RESOURCES: "lesson-resources",
  SUBMISSIONS: "submissions",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
