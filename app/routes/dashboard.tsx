import { useLoaderData, Form, Link } from "react-router";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Share2,
  QrCode as QrCodeIcon,
  Copy,
  Download,
  MoreVertical,
  ChevronDown,
  ExternalLink,
  Check,
} from "lucide-react";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import { getUserQRCodes, deleteQRCode, getUserById, getUserNotifications, markAllNotificationsAsRead } from "~/services";
import type { Route } from "./+types/dashboard";
import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUser(request);
  const user = await getUserById(userId);
  const qrcodes = await getUserQRCodes(userId);
  const notifications = await getUserNotifications(userId);
  return { user, qrcodes, notifications };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const _action = formData.get("_action");

  if (_action === "delete" && id) {
    await deleteQRCode(parseInt(id as string), userId);
    return { success: true };
  }

  if (_action === "mark_read") {
    await markAllNotificationsAsRead(userId);
    return { success: true };
  }

  return null;
}

export default function Dashboard() {
  const { user, qrcodes, notifications } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredQRCodes = useMemo(() =>
    qrcodes.filter((qr: any) => {
      const name = `${qr.name || ""} ${qr.surname || ""}`.toLowerCase();
      const uniqueId = (qr.unique_id || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || uniqueId.includes(search);
      const matchesStatus = activeFilter === "all" || qr.status === activeFilter;
      return matchesSearch && matchesStatus;
    }),
    [qrcodes, searchTerm, activeFilter]
  );

  const allSelected = selectedIds.length === filteredQRCodes.length && filteredQRCodes.length > 0;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filteredQRCodes.map((qr: any) => qr.id));
  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const copyLink = (uniqueId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/public-card/${uniqueId}`);
  };

  const downloadQRCode = (uniqueId: string, name: string) => {
    const svg = document.getElementById(`qr-${uniqueId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 4;
      canvas.height = img.height * 4;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngFile = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `QR-${name.replace(/\s+/g, "-")}.png`;
        a.href = pngFile;
        a.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <DashboardLayout
      title="My QR Codes"
      subtitle="Manage and track your digital assets"
      user={user as any}
      notifications={notifications}
    >

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10 group-focus-within:text-base-content transition-colors" />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Search by name, title or identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost border border-base-300 bg-base-100 flex gap-2 font-bold text-base-content/70 hover:border-base-content/20 transition-all">
              Status: {activeFilter === "all" ? "All" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-xl bg-base-100 border border-base-300 rounded-lg w-44 mt-2">
              <li><button onClick={() => setActiveFilter("all")}>All Assets</button></li>
              <li><button onClick={() => setActiveFilter("published")}>Published</button></li>
              <li><button onClick={() => setActiveFilter("draft")}>Drafts</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && (
        <div className="bg-neutral text-neutral-content px-4 py-2 rounded-lg mb-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-neutral-content/20 flex items-center justify-center text-xs font-bold">{selectedIds.length}</span>
            <p className="font-bold">Items Selected</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-ghost text-neutral-content border border-neutral-content/20 hover:bg-neutral-content/10 rounded-md font-bold px-3">Archive</button>
            <button className="btn btn-xs btn-ghost text-error border border-error/20 hover:bg-error/10 rounded-md font-bold px-3">Delete</button>
            <button onClick={() => setSelectedIds([])} className="btn btn-xs btn-circle btn-ghost text-neutral-content ml-1">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-visible">
          <table className="table w-full overflow-visible">
            <thead>
              <tr className="border-b border-base-300">
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-base-content/50 font-bold">QR Code</th>
                <th className="text-base-content/50 font-bold">Profile</th>
                <th className="text-base-content/50 font-bold text-center">Scans</th>
                <th className="text-base-content/50 font-bold hidden lg:table-cell">Modified</th>
                <th className="text-base-content/50 font-bold">Status</th>
                <th className="text-base-content/50 font-bold text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="overflow-visible">
              {filteredQRCodes.map((qr: any) => (
                <tr
                  key={qr.id}
                  className={`hover:bg-base-200/50 group border-b border-base-300/50 transition-colors overflow-visible ${selectedIds.includes(qr.id) ? "bg-primary/5" : ""}`}
                >
                  {/* Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedIds.includes(qr.id)}
                      onChange={() => toggleSelect(qr.id)}
                    />
                  </td>

                  {/* QR Thumb */}
                  <td>
                    <div className="bg-white border border-base-300 p-2 rounded-lg inline-flex shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <QRCodeSVG
                        id={`qr-${qr.unique_id}`}
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/public-card/${qr.unique_id}`}
                        size={72}
                        level="H"
                        includeMargin={false}
                        fgColor="#000000"
                      />
                    </div>
                  </td>

                  {/* Profile info */}
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">
                          {qr.name || "Unnamed"} {qr.surname}
                        </p>
                      </div>
                      <Link
                        to={`/public-card/${qr.unique_id}`}
                        target="_blank"
                        className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1.5"
                      >
                        {qr.unique_id}.armyqr.com
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <p className="text-sm text-base-content/50 mt-0.5">
                        {qr.title || "vCard Profile"}
                      </p>
                    </div>
                  </td>

                  {/* Scans */}
                  <td className="text-center">
                    <span className="font-bold text-lg">{qr.scans || 0}</span>
                    <p className="text-xs text-base-content/30 font-bold">Scans</p>
                  </td>

                  {/* Modified date */}
                  <td className="hidden lg:table-cell">
                    <p className="font-bold">
                      {new Date(qr.updated_at || qr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-xs text-base-content/30">
                      Created {new Date(qr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </td>

                  {/* Status */}
                  <td>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${qr.status === "published"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-base-300/30 text-base-content/40 border-base-300"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${qr.status === "published" ? "bg-success" : "bg-base-content/20"}`} />
                      {qr.status === "published" ? "Published" : "Draft"}
                    </div>
                  </td>

                  {/* Actions - INLINE BUTTONS */}
                  <td className="overflow-visible">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyLink(qr.unique_id)}
                        className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadQRCode(qr.unique_id, qr.name)}
                        className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Download PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/edit-qrcode/${qr.id}`}
                        className="btn btn-ghost btn-sm btn-square hover:bg-base-300"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <Form
                        method="post"
                        onSubmit={(e) => !confirm("Delete this QR code?") && e.preventDefault()}
                        className="inline"
                      >
                        <input type="hidden" name="id" value={qr.id} />
                        <button
                          type="submit"
                          name="_action"
                          value="delete"
                          className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQRCodes.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCodeIcon className="w-8 h-8 text-base-content/10" />
            </div>
            <h3 className="font-bold">No QR Codes Found</h3>
            <p className="text-sm text-base-content/40 mt-1 max-w-xs mx-auto">
              Ready to create your first QR code? Click "New QR" to start.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
