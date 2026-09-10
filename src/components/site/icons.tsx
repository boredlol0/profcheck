"use client";

export function Icon({ id, className = "icon" }: { id: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

const AVATARS = ["avatar-a", "avatar-b", "avatar-c"] as const;

export function avatarFor(index: number): string {
  return AVATARS[index % AVATARS.length];
}

export function IconSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
        <symbol id="i-arrow-up" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6h12v12" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7" /></symbol>
        <symbol id="i-chat" viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2 1.5-5A8 8 0 1 1 20 11.5Z" /><path d="M7 10h8M7 13h5" /></symbol>
        <symbol id="i-cap" viewBox="0 0 24 24"><path d="m2 9 10-5 10 5-10 5L2 9ZM6 11v6c4 3 8 3 12 0v-6M22 9v7" /></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" /></symbol>
        <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></symbol>
        <symbol id="pin" viewBox="0 0 24 24"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2" /></symbol>
        <symbol id="chevron" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></symbol>
        <symbol id="grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></symbol>
        <symbol id="list" viewBox="0 0 24 24"><path d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01" /></symbol>
        <symbol id="filter" viewBox="0 0 24 24"><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="#fffefa" /><circle cx="15" cy="17" r="2" fill="#fffefa" /></symbol>
        <symbol id="close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></symbol>
        <symbol id="menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></symbol>
        <symbol id="book" viewBox="0 0 24 24"><path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1ZM12 5v15" /></symbol>
        <symbol id="share" viewBox="0 0 24 24"><path d="M12 16V3m-4 4 4-4 4 4M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" /></symbol>
        <symbol id="thumb" viewBox="0 0 24 24"><path d="M8 21H4V10h4m0 11h9a2 2 0 0 0 2-1.6l2-9A2 2 0 0 0 19 8h-6l1-4a2 2 0 0 0-3-2L8 10v11Z" /></symbol>
        <symbol id="person" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></symbol>
        <symbol id="mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></symbol>
        <symbol id="key" viewBox="0 0 24 24"><circle cx="8" cy="9" r="5" /><path d="m12 12 9 9M16 16l3-3M19 19l3-3" /></symbol>
        <symbol id="spark" viewBox="0 0 60 60">
          <path fill="currentColor" d="m30 0 5.4 19.8L51.2 8.8 40.3 24.6 60 30l-19.7 5.4 10.9 15.8-15.8-11L30 60l-5.4-19.8-15.8 11 11-15.8L0 30l19.8-5.4-11-15.8 15.8 11Z" />
        </symbol>
        <symbol id="brand" viewBox="0 0 38 42">
          <path fill="#d4f67a" stroke="#23271e" strokeWidth="1.5" d="m19 2 5 5 7 1 1 7 4 6-4 6-1 7-7 1-5 5-5-5-7-1-1-7-4-6 4-6 1-7 7-1Z" />
          <path d="m11 21 5 5 11-11" fill="none" stroke="#23271e" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="avatar-a" viewBox="0 0 80 80">
          <rect width="80" height="80" fill="#e2eacb" />
          <circle cx="67" cy="12" r="22" fill="#cbd9a9" />
          <path d="M8 80c2-21 13-31 32-31s30 10 32 31" fill="#697b56" />
          <path d="m30 52 10 12 10-12" fill="#f7f4e8" />
          <rect x="34" y="42" width="12" height="16" rx="6" fill="#c88f65" />
          <ellipse cx="40" cy="32" rx="15" ry="18" fill="#dfac82" />
          <path d="M25 30c-5-17 7-23 17-22 14 1 16 11 13 24l-4-11c-11 4-15-1-15-1l-8 12Z" fill="#343b2d" />
          <path d="M26 32h12m4 0h12m-16 0h4" stroke="#343b2d" strokeWidth="1.5" />
          <rect x="27" y="29" width="10" height="7" rx="2" fill="none" stroke="#343b2d" strokeWidth="1.5" />
          <rect x="43" y="29" width="10" height="7" rx="2" fill="none" stroke="#343b2d" strokeWidth="1.5" />
          <path d="M36 42q4 3 8 0" fill="none" stroke="#985f42" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>
        <symbol id="avatar-b" viewBox="0 0 80 80">
          <rect width="80" height="80" fill="#e7dff0" />
          <circle cx="10" cy="13" r="22" fill="#d6c8e5" />
          <path d="M22 50V28c0-16 8-22 19-22s19 8 19 22v26" fill="#493a47" />
          <path d="M8 80c2-22 13-30 32-30s30 8 32 30" fill="#9b7eaa" />
          <rect x="34" y="42" width="12" height="16" rx="6" fill="#ba805e" />
          <ellipse cx="40" cy="31" rx="14" ry="18" fill="#d69d78" />
          <path d="M26 27c0-15 8-20 17-19 9 0 14 9 13 19-9-1-16-5-19-10-1 5-5 8-11 10Z" fill="#493a47" />
          <circle cx="34" cy="31" r="1.2" fill="#493a47" /><circle cx="46" cy="31" r="1.2" fill="#493a47" />
          <path d="M36 40q4 4 8 0" stroke="#965e4e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="26" cy="37" r="2" fill="#e9c56c" /><circle cx="54" cy="37" r="2" fill="#e9c56c" />
          <path d="m29 53 11 16 12-16" fill="none" stroke="#c4acd0" strokeWidth="3" />
        </symbol>
        <symbol id="avatar-c" viewBox="0 0 80 80">
          <rect width="80" height="80" fill="#f3dfc8" />
          <circle cx="68" cy="11" r="24" fill="#ecd0ad" />
          <path d="M7 80c2-22 15-30 33-30s30 8 33 30" fill="#aa785a" />
          <path d="m29 53 11 10 11-10-4 27H33Z" fill="#f5e9d9" />
          <rect x="34" y="42" width="12" height="16" rx="5" fill="#a66c48" />
          <ellipse cx="40" cy="31" rx="15" ry="18" fill="#c88e61" />
          <path d="M25 27C21 13 30 7 39 7c15 0 21 9 17 23l-5-13c-8 5-16 5-23 4Z" fill="#343631" />
          <path d="M28 36c2 12 6 15 12 15s12-4 13-15l-7 5H34Z" fill="#484339" />
          <circle cx="34" cy="31" r="1.3" fill="#343631" /><circle cx="46" cy="31" r="1.3" fill="#343631" />
          <path d="M36 41h8" stroke="#e2b58f" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>
      </defs>
    </svg>
  );
}
