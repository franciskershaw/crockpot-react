export function goToGoogleLogin(): void {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
}
