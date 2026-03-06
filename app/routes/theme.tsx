import { useState, useRef } from "react";
import { useLoaderData, Form } from "react-router";
import { Plus, Trash2, Edit2, X, Check, Palette, Type, Save } from "lucide-react";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import { getUserThemes, getUserById, createTheme, deleteTheme, updateTheme, getUserNotifications, createNotification } from "~/services";

export async function loader({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const user = await getUserById(userId);
  const themes = await getUserThemes(userId);
  const notifications = await getUserNotifications(userId);
  return { user, themes, notifications };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "create") {
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string;
    const legal_info = formData.get("legal_info") as string;
    const welcome_screen_time = parseInt(formData.get("welcome_screen_time") as string || "5");
    const welcome_image = formData.get("welcome_image") as string;
    const enable_welcome = formData.get("enable_welcome") === "on";

    await createTheme({ name, primary_color, legal_info, welcome_screen_time, welcome_image, enable_welcome, user_id: userId });
    await createNotification({
      user_id: userId,
      title: "Theme Created",
      message: `New theme "${name}" has been created.`,
      type: "success"
    });
    return { success: true };
  }

  if (_action === "update") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const primary_color = formData.get("primary_color") as string;
    const legal_info = formData.get("legal_info") as string;
    const welcome_screen_time = parseInt(formData.get("welcome_screen_time") as string || "5");
    const welcome_image = formData.get("welcome_image") as string;
    const enable_welcome = formData.get("enable_welcome") === "on";

    await updateTheme(parseInt(id), userId, { name, primary_color, legal_info, welcome_screen_time, welcome_image, enable_welcome });
    await createNotification({
      user_id: userId,
      title: "Theme Updated",
      message: `Theme "${name}" has been updated.`,
      type: "info"
    });
    return { success: true };
  }

  if (_action === "delete") {
    const id = formData.get("id") as string;
    await deleteTheme(parseInt(id), userId);
    return { success: true };
  }

  return null;
}

export default function Theme() {
  const { user, themes, notifications } = useLoaderData<any>();
  const modalRef = useRef<HTMLDialogElement>(null);
  const editModalRef = useRef<HTMLDialogElement>(null);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [welcomeImage, setWelcomeImage] = useState<string | null>(null);

  const [createEnableWelcome, setCreateEnableWelcome] = useState<boolean>(true);
  const [editEnableWelcome, setEditEnableWelcome] = useState<boolean>(true);

  const handleEdit = (theme: any) => {
    setEditingTheme(theme);
    setWelcomeImage(theme.welcome_image || null);
    setEditEnableWelcome(theme.enable_welcome !== 0);
    editModalRef.current?.showModal();
  };

  const handleCreateNew = () => {
    setEditingTheme(null);
    setWelcomeImage(null);
    setCreateEnableWelcome(true);
    modalRef.current?.showModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setWelcomeImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout
      title="Theme Management"
      subtitle="Customize your profile appearance"
      user={user}
      notifications={notifications}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((t: any) => (
            <div key={t.id} className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-2 w-full" style={{ backgroundColor: t.primary_color }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base-content">
                    {t.name}
                  </h3>
                  <div className="w-6 h-6 rounded-full border border-base-300 shadow-inner" style={{ backgroundColor: t.primary_color }} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/50 font-medium">Primary Color</span>
                    <span className="font-bold font-mono text-[11px] uppercase">{t.primary_color}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/50 font-medium">Author</span>
                    <span className="font-bold text-[11px] opacity-40">{t.user_id ? 'Custom' : 'System'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-base-300 pt-4">
                  {t.user_id && (
                    <>
                      <button onClick={() => handleEdit(t)} className="btn btn-ghost btn-sm btn-square hover:bg-base-200">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <Form method="post" onSubmit={(e) => !confirm("Delete this theme?") && e.preventDefault()}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" name="_action" value="delete" className="btn btn-ghost btn-sm btn-square hover:bg-error/10 hover:text-error">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </>
                  )}
                  {!t.user_id && (
                    <span className="text-[10px] font-bold text-base-content/20 italic">Global Theme</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleCreateNew} className="bg-base-200/50 border-2 border-dashed border-base-300 rounded-lg p-10 flex flex-col items-center justify-center text-base-content/30 hover:bg-base-200 hover:text-base-content/50 transition-all gap-3 overflow-hidden cursor-pointer active:scale-95">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm">Add New Theme</p>
          </button>
        </div>
      </div>

      {/* Add Theme Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 overflow-hidden border border-base-300 shadow-2xl rounded-lg bg-base-100">
          <div className="px-6 py-4 flex items-center justify-between bg-base-200/50">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Create New Theme</h3>
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-circle"><X className="w-4 h-4" /></button>
            </form>
          </div>

          <Form method="post" onSubmit={() => modalRef.current?.close()} className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Theme Name</span>
              </label>
              <div className="input input-bordered w-full flex items-center gap-3">
                <Type className="w-4 h-4 text-base-content/30" />
                <input name="name" type="text" className="grow font-medium" placeholder="E.g. Modern Red" required />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Primary Color</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="primary_color"
                  defaultValue="#dc2626"
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-base-300 p-1 bg-white"
                />
                <input
                  type="text"
                  placeholder="#dc2626"
                  className="input input-bordered grow font-mono font-bold"
                  defaultValue="#dc2626"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Legal Information</span>
              </label>
              <textarea
                name="legal_info"
                className="textarea textarea-bordered font-medium min-h-[80px] w-full flex"
                placeholder="Copyright © 2026. All rights reserved."
              ></textarea>
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Welcome Duration (sec)</span>
              </label>
              <input
                name="welcome_screen_time"
                type="number"
                min="0"
                max="30"
                defaultValue="5"
                disabled={!createEnableWelcome}
                className={`input input-bordered font-medium w-full ${!createEnableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="form-control flex flex-row items-center justify-between py-2">
              <span className="label-text font-bold text-base-content/70">Enable Welcome Screen</span>
              <input
                type="checkbox"
                name="enable_welcome"
                className="toggle toggle-primary"
                checked={createEnableWelcome}
                onChange={(e) => setCreateEnableWelcome(e.target.checked)}
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Welcome Splash Image</span>
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={!createEnableWelcome}
                  className={`file-input file-input-bordered h-10 file-input-sm w-full font-medium ${!createEnableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {welcomeImage && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-base-300 shadow-sm bg-base-200">
                    <img src={welcomeImage} alt="Welcome Splash Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setWelcomeImage(null)}
                      className="absolute top-2 right-2 btn btn-xs btn-circle btn-error shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input type="hidden" name="welcome_image" value={welcomeImage || ""} />
              </div>
            </div>

            <div className="modal-action pt-2">
              <form method="dialog">
                <button className="btn btn-ghost font-bold">Cancel</button>
              </form>
              <button type="submit" name="_action" value="create" className="btn-army px-6">
                <Plus className="w-4 h-4" />
                Create Theme
              </button>
            </div>
          </Form>
        </div>
        <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-[2px]">
          <button>close</button>
        </form>
      </dialog>

      {/* Edit Theme Modal */}
      <dialog ref={editModalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 overflow-hidden border border-base-300 shadow-2xl rounded-lg bg-base-100">
          <div className="px-6 py-4 flex items-center justify-between bg-base-200/50">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Edit Theme</h3>
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-circle"><X className="w-4 h-4" /></button>
            </form>
          </div>

          <Form method="post" onSubmit={() => editModalRef.current?.close()} className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <input type="hidden" name="id" value={editingTheme?.id} />
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Theme Name</span>
              </label>
              <div className="input input-bordered w-full flex items-center gap-3">
                <Type className="w-4 h-4 text-base-content/30" />
                <input
                  name="name"
                  type="text"
                  className="grow font-medium"
                  defaultValue={editingTheme?.name}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Primary Color</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="primary_color"
                  defaultValue={editingTheme?.primary_color}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-base-300 p-1 bg-white"
                />
                <input
                  type="text"
                  className="input input-bordered w-full grow font-mono font-bold"
                  defaultValue={editingTheme?.primary_color}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Legal Information</span>
              </label>
              <textarea
                name="legal_info"
                className="textarea textarea-bordered font-medium min-h-[80px] flex w-full"
                defaultValue={editingTheme?.legal_info}
              ></textarea>
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Welcome Duration (sec)</span>
              </label>
              <input
                name="welcome_screen_time"
                type="number"
                min="0"
                max="30"
                defaultValue={editingTheme?.welcome_screen_time || 5}
                disabled={!editEnableWelcome}
                className={`input input-bordered font-medium w-full ${!editEnableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="form-control flex flex-row items-center justify-between py-2">
              <span className="label-text font-bold text-base-content/70">Enable Welcome Screen</span>
              <input
                type="checkbox"
                name="enable_welcome"
                className="toggle toggle-primary"
                checked={editEnableWelcome}
                onChange={(e) => setEditEnableWelcome(e.target.checked)}
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold text-base-content/70">Welcome Splash Image</span>
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={!editEnableWelcome}
                  className={`file-input file-input-bordered h-10 file-input-sm w-full font-medium ${!editEnableWelcome ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {welcomeImage && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-base-300 shadow-sm bg-base-200">
                    <img src={welcomeImage} alt="Welcome Splash Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setWelcomeImage(null)}
                      className="absolute top-2 right-2 btn btn-xs btn-circle btn-error shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input type="hidden" name="welcome_image" value={welcomeImage || ""} />
              </div>
            </div>

            <div className="modal-action pt-2">
              <form method="dialog">
                <button className="btn btn-ghost font-bold">Cancel</button>
              </form>
              <button type="submit" name="_action" value="update" className="btn-army px-6 gap-2">
                <Save className="w-4 h-4" />
                Update Theme
              </button>
            </div>
          </Form>
        </div>
        <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-[2px]">
          <button>close</button>
        </form>
      </dialog>
    </DashboardLayout>
  );
}
