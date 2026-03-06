import { useLoaderData } from "react-router";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import { getQRCodeById, updateQRCode, getUserThemes, getUserById, getUserNotifications, createNotification } from "~/services";
import QRCodeForm from "~/components/shared/QRCodeForm";

export async function loader({ params, request }: { params: any; request: Request }) {
  const userId = await requireUser(request);
  const themes = await getUserThemes(userId);
  const user = await getUserById(userId);
  const qrcode = await getQRCodeById(parseInt(params.id), userId);

  if (!qrcode || qrcode.user_id !== userId) {
    throw new Response("Not Found", { status: 404 });
  }

  const notifications = await getUserNotifications(userId);
  return { themes, qrcode, user, notifications };
}

export async function action({ params, request }: { params: any; request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action !== "update_qrcode") return null;

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const title = formData.get("title") as string;
  const social = formData.get("social_network") as string;
  const themeId = formData.get("theme_id") as string;
  const status = formData.get("status") as string;
  const profileImage = formData.get("profile_image_data") as string;
  const phones = formData.getAll("phones[]") as string[];
  const emails = formData.getAll("emails[]") as string[];

  await updateQRCode(parseInt(params.id), userId, {
    name,
    surname,
    title,
    status,
    email: emails[0] || "",
    profile_image: profileImage,
    social_network: social,
    theme_id: parseInt(themeId),
    phones,
  });

  await createNotification({
    user_id: userId,
    title: "QR Code Updated",
    message: `Changes to "${name} ${surname}" have been saved.`,
    type: "info"
  });

  return { success: true };
}

export default function EditQRCode() {
  const { themes, qrcode, user, notifications } = useLoaderData<any>();

  return (
    <DashboardLayout
      title="Edit QR Code"
      subtitle="Update your digital assets"
      user={user as any}
      notifications={notifications}
    >
      <QRCodeForm
        mode="edit"
        themes={themes}
        initialQRCode={qrcode}
        user={user}
      />
    </DashboardLayout>
  );
}