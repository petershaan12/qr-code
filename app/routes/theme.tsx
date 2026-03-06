import { useState } from "react";
import { useLoaderData, Form } from "react-router";
import { Plus, Edit, Trash2, X, Check, Palette } from "lucide-react";
import { getDb } from "~/.server/db";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Theme {
  id: number;
  name: string;
  primary_color: string;
  legal_info: string;
  user_id: number | null;
  created_at: string;
}

interface LoaderData {
  user: User;
  themes: Theme[];
}

export async function loader({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const db = getDb();

  const [users] = await db.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [userId],
  );
  const [themes] = await db.query(
    "SELECT * FROM themes WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC",
    [userId],
  );

  return { user: users[0], themes };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const _action = formData.get("_action");
  const db = getDb();

  if (_action === "create" || _action === "edit") {
    const name = formData.get("name") as string;
    const color = formData.get("primary_color") as string;
    const legal = formData.get("legal_info") as string;
    const id = formData.get("id") as string;

    if (_action === "create") {
      await db.query(
        "INSERT INTO themes (name, primary_color, legal_info, user_id) VALUES (?, ?, ?, ?)",
        [name, color, legal, userId],
      );
    } else {
      await db.query(
        "UPDATE themes SET name = ?, primary_color = ?, legal_info = ? WHERE id = ? AND user_id = ?",
        [name, color, legal, id, userId],
      );
    }
    return { success: true };
  }

  if (_action === "delete") {
    const id = formData.get("id") as string;
    await db.query("DELETE FROM themes WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
    return { success: true };
  }

  return null;
}

export default function ThemePage() {
  const { user, themes } = useLoaderData<LoaderData>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  const openCreate = () => {
    setEditingTheme(null);
    setShowModal(true);
  };

  const openEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setShowModal(true);
  };

  return (
    <DashboardLayout
      title="Themes Management"
      subtitle="Create and customize your business card templates"
      user={user}
    >
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="btn-army">
          <Plus className="w-4 h-4" />
          Add New Theme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme: Theme) => (
          <div
            key={theme.id}
            className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm group"
          >
            <div
              className="h-24 relative"
              style={{ backgroundColor: theme.primary_color }}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openEdit(theme)}
                  className="btn btn-sm btn-circle bg-white text-gray-900 border-none hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {theme.user_id && (
                  <Form
                    method="post"
                    className="inline"
                    onSubmit={(e) => {
                      if (!confirm("Delete theme?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={theme.id.toString()} />
                    <button
                      type="submit"
                      name="_action"
                      value="delete"
                      className="btn btn-sm btn-circle bg-white text-red-600 border-none hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Form>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{theme.name}</h3>
                <span className="text-[10px] bg-base-200 px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                  {theme.user_id ? "Custom" : "System"}
                </span>
              </div>
              <p className="text-sm text-base-content/40 italic line-clamp-2 min-h-[2.5rem]">
                "{theme.legal_info || "No legal info"}"
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-base-300"
                  style={{ backgroundColor: theme.primary_color }}
                />
                <span className="text-xs font-mono opacity-50">
                  {theme.primary_color}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in-center">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingTheme ? "Edit Theme" : "Create New Theme"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-base-200"
              >
                <X className="w-5 h-5 opacity-50" />
              </button>
            </div>

            <Form
              method="post"
              className="space-y-4"
              onSubmit={() => setShowModal(false)}
            >
              <input type="hidden" name="id" value={editingTheme?.id.toString() || ""} />
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Theme Name
                </label>
                <input
                  name="name"
                  type="text"
                  className="input input-bordered w-full"
                  defaultValue={editingTheme?.name || ""}
                  placeholder="E.g. Summer Red"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    name="primary_color"
                    type="color"
                    className="w-12 h-12 rounded-lg cursor-pointer flex-shrink-0"
                    defaultValue={editingTheme?.primary_color || "#DC2626"}
                  />
                  <input
                    name="primary_color_text"
                    type="text"
                    className="input input-bordered flex-1 font-mono uppercase"
                    placeholder="#000000"
                    defaultValue={editingTheme?.primary_color || "#DC2626"}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Legal Information
                </label>
                <textarea
                  name="legal_info"
                  className="textarea textarea-bordered w-full h-24"
                  defaultValue={editingTheme?.legal_info || ""}
                  placeholder="Copyright and legal disclaimer..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  name="_action"
                  value={editingTheme ? "edit" : "create"}
                  className="btn-army flex-1 justify-center"
                >
                  <Check className="w-4 h-4" />
                  {editingTheme ? "Save Changes" : "Create Theme"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
