// Single source of truth for dashboard navigation.
// Sidebar, mobile drawer, and breadcrumbs all read from here, so a new
// section only needs one entry to appear everywhere.
import {
  IconAbout,
  IconBag,
  IconContact,
  IconHero,
  IconOverview,
  IconPortfolio,
  IconTag,
  IconUsers,
} from "@/components/ui/icons.jsx";

export const NAV_SECTIONS = [
  {
    label: "Manage",
    items: [
      {
        href: "/admin",
        label: "Overview",
        exact: true,
        icon: IconOverview,
      },
      {
        href: "/admin/works",
        label: "Portfolio",
        icon: IconPortfolio,
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: IconTag,
      },
      {
        href: "/admin/hero",
        label: "Hero",
        icon: IconHero,
      },
      {
        href: "/admin/about",
        label: "About",
        icon: IconAbout,
      },
      {
        href: "/admin/contact",
        label: "Contact",
        icon: IconContact,
        badgeKey: "inquiries",
      },
      {
        href: "/admin/users",
        label: "Users",
        icon: IconUsers,
        badgeKey: "users",
      },
      {
        href: "/admin/orders",
        label: "Orders",
        icon: IconBag,
        badgeKey: "orders",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

// Breadcrumb labels for URL segments under /admin.
export const SEGMENT_LABELS = {
  works: "Portfolio",
  new: "New work",
  categories: "Categories",
  hero: "Hero",
  about: "About",
  contact: "Contact",
  users: "Users",
  orders: "Orders",
};

// Friendly labels for dynamic route segments ([slug]/[id]) — keyed by
// the PARENT segment, since the child segment itself is the raw id.
export const DETAIL_SEGMENT_LABELS = {
  works: "Edit work",
  users: "Customer details",
  orders: "Order details",
};
