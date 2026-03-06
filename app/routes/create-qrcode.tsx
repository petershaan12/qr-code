import { useLoaderData, redirect } from "react-router";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import { createQRCode, getUserThemes, getUserById, getUserNotifications } from "~/services";
import QRCodeForm from "~/components/shared/QRCodeForm";

export async function loader({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const themes = await getUserThemes(userId);

  if (themes.length === 0) {
    return redirect("/theme?error=no_themes");
  }

  const user = await getUserById(userId);
  const notifications = await getUserNotifications(userId);
  return { themes, user, notifications };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action !== "create_qrcode") return null;

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const title = formData.get("title") as string;
  const social = formData.get("social_network") as string;
  const themeId = formData.get("theme_id") as string;
  const profileImage = formData.get("profile_image_data") as string;
  const phones = formData.getAll("phones[]") as string[];
  const emails = formData.getAll("emails[]") as string[];

  const qr = await createQRCode({
    user_id: userId,
    name,
    surname,
    title,
    email: emails[0] || "",
    profile_image: profileImage,
    social_network: social,
    theme_id: parseInt(themeId),
    status: "draft",
    phones,
  });

  return redirect(`/edit-qrcode/${qr.id}?step=2`);
}

export default function CreateQRCode() {
  const { themes, user, notifications } = useLoaderData<any>();

  return (
    <DashboardLayout
      title="Create QR Code"
      subtitle="Build your digital identity"
      user={user as any}
      notifications={notifications}
    >
      <QRCodeForm 
        mode="create" 
        themes={themes} 
        user={user} 
      />
    </DashboardLayout>
  );
}
