"use client";

export function GithubIcon({ size = 18, color = "currentColor", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function LinkedinIcon({ size = 18, color = "currentColor", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function TwitterIcon({ size = 18, color = "currentColor", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, color = "currentColor", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WebsiteLogoIcon({ size = 26, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={style}>
      <path
        d="M8 12L18 30L23 20L15 12H8Z"
        fill="url(#paint0_brand_vp)"
      />
      <path
        d="M22 12H30C32.7614 12 35 14.2386 35 17C35 19.7614 32.7614 22 30 22H24L21 28H18L24 16H30C30.5523 16 31 16.4477 31 17C31 17.5523 30.5523 18 30 18H25L22 12Z"
        fill="url(#paint1_brand_vp)"
      />
      <defs>
        <linearGradient id="paint0_brand_vp" x1="8" y1="12" x2="23" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="paint1_brand_vp" x1="18" y1="12" x2="35" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C8FF45" />
          <stop offset="1" stopColor="#A3E635" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default {
  Github: GithubIcon,
  Linkedin: LinkedinIcon,
  Twitter: TwitterIcon,
  Instagram: InstagramIcon,
  WebsiteLogo: WebsiteLogoIcon,
};
