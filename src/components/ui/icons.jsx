// Lightweight inline SVG icon set for the dashboard.
// One file keeps the icon surface small and tree-shakeable by bundler.
// All icons inherit `currentColor` and accept a className.

function Icon({ className = "h-5 w-5", children, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconOverview = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icon>
);

export const IconPortfolio = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="M21 16l-5-5-6 6-2-2-5 4" />
  </Icon>
);

export const IconHero = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 15l4.5-4.5L12 15" />
    <path d="M14 13.5L16.5 11l4.5 4" />
    <circle cx="15" cy="8.5" r="1.25" />
  </Icon>
);

export const IconAbout = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Icon>
);

export const IconContact = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 7.5l8.5 6 8.5-6" />
  </Icon>
);

export const IconPlus = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconSearch = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </Icon>
);

export const IconDots = (props) => (
  <Icon {...props} strokeWidth="2">
    <circle cx="12" cy="5.5" r="0.5" fill="currentColor" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    <circle cx="12" cy="18.5" r="0.5" fill="currentColor" />
  </Icon>
);

export const IconEdit = (props) => (
  <Icon {...props}>
    <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z" />
    <path d="M14.5 6.5l3 3" />
  </Icon>
);

export const IconTrash = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" />
    <path d="M6.5 7l.75 12a2 2 0 0 0 2 1.9h5.5a2 2 0 0 0 2-1.9L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export const IconExternal = (props) => (
  <Icon {...props}>
    <path d="M14 4h6v6" />
    <path d="M20 4L11 13" />
    <path d="M19 13.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5h5.5" />
  </Icon>
);

export const IconCheck = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </Icon>
);

export const IconAlert = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5" />
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
  </Icon>
);

export const IconInfo = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.75" r="0.5" fill="currentColor" />
  </Icon>
);

export const IconClose = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const IconChevronDown = (props) => (
  <Icon {...props}>
    <path d="M5 9l7 7 7-7" />
  </Icon>
);

export const IconChevronRight = (props) => (
  <Icon {...props}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
);

export const IconArrowLeft = (props) => (
  <Icon {...props}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Icon>
);

export const IconArrowRight = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
);

export const IconMenu = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const IconInbox = (props) => (
  <Icon {...props}>
    <path d="M3.5 13.5h4l1.5 3h6l1.5-3h4" />
    <path d="M5.5 5.5h13l2 8v4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-4l2-8z" />
  </Icon>
);

export const IconFolderPlus = (props) => (
  <Icon {...props}>
    <path d="M3.5 7A2 2 0 0 1 5.5 5H10l2 2.5h6.5a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7z" />
    <path d="M12 10.5v5M9.5 13h5" />
  </Icon>
);

export const IconStar = (props) => (
  <Icon {...props}>
    <path d="M12 4l2.35 4.9 5.15.7-3.75 3.7.9 5.2L12 16l-4.65 2.5.9-5.2-3.75-3.7 5.15-.7L12 4z" />
  </Icon>
);

export const IconUsers = (props) => (
  <Icon {...props}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M3 19.5a6 6 0 0 1 12 0" />
    <path d="M15.5 5.5a3.5 3.5 0 0 1 0 6.5" />
    <path d="M17 14.5a6 6 0 0 1 4 5" />
  </Icon>
);

export const IconMessage = (props) => (
  <Icon {...props}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5v-7z" />
  </Icon>
);

export const IconImage = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="M21 16l-5-5-6 6-2-2-5 4" />
  </Icon>
);

export const IconEye = (props) => (
  <Icon {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 18.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const IconEyeOff = (props) => (
  <Icon {...props}>
    <path d="M4 4l16 16" />
    <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.3 4.1M6.4 7.9A17 17 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9.5 9.5 0 0 0 3.3-.6" />
    <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
  </Icon>
);

export const IconTag = (props) => (
  <Icon {...props}>
    <path d="M3.5 11.7V5.5A2 2 0 0 1 5.5 3.5h6.2c.5 0 1 .2 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0l-7-7c-.4-.4-.6-.9-.6-1.4z" />
    <circle cx="8" cy="8" r="1.5" />
  </Icon>
);

export const IconShield = (props) => (
  <Icon {...props}>
    <path d="M12 3.5l7 2.5v5.5c0 4.2-2.9 7.5-7 9-4.1-1.5-7-4.8-7-9V6l7-2.5z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);

export const IconLoader = (props) => (
  <Icon {...props} className={`${props.className ?? ""} animate-spin`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </Icon>
);
