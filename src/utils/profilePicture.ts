// ...existing code...

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api/v1'
  : 'http://15.156.127.37/api/v1';

export function getProfilePictureUrl({ imagePreview, profile_picture }: { imagePreview?: string | null, profile_picture?: string | null }) {
  if (imagePreview) return imagePreview;
  if (!profile_picture) return "/user/avatar-sf.png";
  if (profile_picture.startsWith('http')) return profile_picture;
  return `${BACKEND_URL}${profile_picture}`;
}
// ...existing code...
