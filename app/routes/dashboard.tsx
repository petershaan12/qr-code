import { useLoaderData, Form, Link } from "react-router";
import {
  Search,
  Plus,
  Trash2,
  Share2,
  QrCode as QrCodeIcon,
} from "lucide-react";
import { getDb } from "@/.server/db";
import { requireUser } from "@/.server/auth";
import DashboardLayout from "@/components/DashboardLayout";
import type { Route } from "./+types/dashboard";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface QRCode {
  id: number;
  name: string;
  surname: string;
  title: string;
  email: string;
  scans: number;
  status: string;
  created_at: string;
  main_phone?: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUser(request);
  const db = getDb();

  const [users]: any = await db.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [userId],
  );

  const [qrcodes]: any = await db.query(
    `
    SELECT q.*,
    (SELECT phone FROM qrcode_phones WHERE qrcode_id = q.id LIMIT 1) as main_phone
    FROM qrcodes q
    WHERE q.user_id = ?
    ORDER BY q.created_at DESC
  `,
    [userId],
  );

  return { user: users[0], qrcodes };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const _action = formData.get("_action");

  if (_action === "delete") {
    const db = getDb();
    await db.query("DELETE FROM qrcodes WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
    return { success: true };
  }

  return null;
}

export default function Dashboard() {
  const { user, qrcodes } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout
      title="My QR Codes"
      subtitle="Manage and track your generated QR codes"
      user={user}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300 shadow-sm">
          <p className="text-sm text-base-content/50 mb-1">Total QR Codes</p>
          <p className="text-3xl font-bold text-base-content">
            {qrcodes.length}
          </p>
        </div>
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300 shadow-sm">
          <p className="text-sm text-base-content/50 mb-1">Total Scans</p>
          <p className="text-3xl font-bold text-red-600">
            {qrcodes.reduce((sum: number, q: QRCode) => sum + (q.scans || 0), 0)}
          </p>
        </div>
        <div className="bg-base-100 rounded-2xl p-6 border border-base-300 shadow-sm">
          <p className="text-sm text-base-content/50 mb-1">Active Status</p>
          <p className="text-3xl font-bold text-green-600">
            {qrcodes.filter((q: QRCode) => q.status === "published").length}
          </p>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-base-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
              strokeWidth={2}
            />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder="Search QR codes..."
            />
          </div>
          <Link to="/create-qrcode" className="btn-army">
            <Plus className="w-4 h-4" />
            Create QR Code
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="border-b border-base-300">
                <th className="text-xs font-semibold uppercase">QR Name</th>
                <th className="text-xs font-semibold uppercase">Details</th>
                <th className="text-xs font-semibold uppercase">Created At</th>
                <th className="text-xs font-semibold uppercase">Scans</th>
                <th className="text-xs font-semibold uppercase">Status</th>
                <th className="text-right text-xs font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {qrcodes.map((qr: QRCode) => (
                <tr key={qr.id} className="hover:bg-base-200/50">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center">
                        <QrCodeIcon className="w-5 h-5 text-base-content/40" />
                      </div>
                      <span className="font-semibold text-sm">
                        {qr.name} {qr.surname}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs space-y-0.5">
                      <p className="text-base-content/70">{qr.title}</p>
                      <p className="font-medium text-base-content/80 truncate w-32">{qr.email}</p>
                    </div>
                  </td>
                  <td className="text-xs text-base-content/50">
                    {new Date(qr.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold tracking-wider">
                      {qr.scans} SCANS
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${qr.status === "published"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-50 text-gray-500"
                        }`}
                    >
                      {qr.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/card/${qr.id}`}
                        className="p-2 hover:text-red-600 transition-colors"
                        title="View Preview"
                      >
                        <Share2 className="w-4 h-4" />
                      </Link>
                      <Form
                        method="post"
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm("Delete this QR code?"))
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={qr.id} />
                        <button
                          type="submit"
                          name="_action"
                          value="delete"
                          className="p-2 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
              {qrcodes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-base-content/40 italic"
                  >
                    No QR codes found. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
