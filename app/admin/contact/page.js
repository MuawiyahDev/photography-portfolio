// Edit the public Contact section + review form submissions.
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings.js";
import PageHeader from "@/components/admin/PageHeader.jsx";
import ContactForm from "@/components/admin/ContactForm.jsx";
import InquiriesTable from "@/components/admin/InquiriesTable.jsx";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const [contact, inquiries] = await Promise.all([
    getSetting("contact"),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="grid gap-10">
      <div>
        <PageHeader
          title="Contact"
          description="Contact details, social links, and the intro shown on the public contact section."
        />
        <ContactForm content={contact} />
      </div>

      <div>
        <PageHeader
          title="Inquiries"
          description="Messages sent through the public contact form (latest 100)."
        />
        <InquiriesTable inquiries={inquiries} />
      </div>
    </div>
  );
}
