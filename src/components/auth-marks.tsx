export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.07-1.45-.2-2.13H12v4.04h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.43Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.62-2.34l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.09v2.58A10 10 0 0 0 12 22Z"
        opacity=".85"
      />
      <path
        fill="currentColor"
        d="M6.42 13.99A6.01 6.01 0 0 1 6.1 12c0-.69.12-1.36.32-1.99V7.43H3.09A10 10 0 0 0 2 12c0 1.61.38 3.13 1.09 4.57l3.33-2.58Z"
        opacity=".7"
      />
      <path
        fill="currentColor"
        d="M12 5.88c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.89 14.7 2 12 2A10 10 0 0 0 3.09 7.43l3.33 2.58C7.2 7.64 9.4 5.88 12 5.88Z"
        opacity=".55"
      />
    </svg>
  );
}

export function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="currentColor"
        d="M14.7 10.35 21.2 3h-1.54l-5.66 6.38L9.5 3H3.2l6.82 9.64L3.2 21h1.54l5.96-6.72L14.5 21h6.3zm-2.1 2.38-.7-.96L5.24 4.17h2.37l4.45 6.18.69.96 5.8 8.05h-2.37z"
      />
    </svg>
  );
}

export function friendlyAuthError(raw: string | undefined) {
  const text = (raw ?? "").toLowerCase();
  if (text.includes("invalid") || text.includes("credential")) {
    return "That email or password doesn't look right.";
  }
  if (text.includes("exist") || text.includes("already")) {
    return "An account with that email already exists. Try signing in.";
  }
  if (text.includes("password")) {
    return "Please choose a password of at least 8 characters.";
  }
  return "We couldn't complete that just now. Please try again.";
}
