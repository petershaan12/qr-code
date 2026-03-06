import { useState } from "react";
import { useLoaderData, Form } from "react-router";
import { Plus, Edit, Trash2, X, Check, Shield, User as UserIcon, Search } from "lucide-react";
import bcrypt from "bcryptjs";
import { getDb } from "~/.server/db";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import type { Route } from "./+types/users";

export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUser(request);
    const db = getDb();

    const [currentUser]: any = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [userId]);
    if (currentUser[0].role !== 'admin') {
        throw new Response("Unauthorized", { status: 403 });
    }

    const [users]: any = await db.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    return { user: currentUser[0], users };
}

export async function action({ request }: Route.ActionArgs) {
    await requireUser(request);
    const formData = await request.formData();
    const _action = formData.get("_action");
    const db = getDb();

    if (_action === "create" || _action === "edit") {
        const name = formData.get("name");
        const email = formData.get("email");
        const role = formData.get("role");
        const id = formData.get("id");
        const password = formData.get("password") as string | null;

        if (_action === "create") {
            const hash = bcrypt.hashSync(password || "user123", 10);
            await db.query(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, hash, role]
            );
        } else {
            let query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
            let params = [name, email, role, id];

            if (password && password.trim() !== "") {
                const hash = bcrypt.hashSync(password, 10);
                query = "UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?";
                params = [name, email, role, hash, id];
            }
            await db.query(query, params);
        }
        return { success: true };
    }

    if (_action === "delete") {
        const id = formData.get("id");
        await db.query("DELETE FROM users WHERE id = ?", [id]);
        return { success: true };
    }

    return null;
}

export default function UsersPage() {
    const { user, users } = useLoaderData<typeof loader>();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreate = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const openEdit = (u: any) => {
        setEditingUser(u);
        setShowModal(true);
    };

    return (
        <DashboardLayout title="User Management" subtitle="Manage dashboard administrators and staff" user={user}>
            <div className="bg-base-100 rounded-2xl border border-base-300 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={openCreate} className="btn-army">
                    <Plus className="w-4 h-4" />
                    Add New User
                </button>
            </div>

            <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr className="border-b border-base-300">
                                <th className="text-xs font-semibold uppercase">User</th>
                                <th className="text-xs font-semibold uppercase">Role</th>
                                <th className="text-xs font-semibold uppercase">Joined Date</th>
                                <th className="text-right text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u: any) => (
                                <tr key={u.id} className="hover:bg-base-200/50 transition-colors">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{u.name}</p>
                                                <p className="text-xs font-medium text-base-content/60">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="text-xs text-base-content/50">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(u)} className="p-2 hover:text-red-600 transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {u.id !== user.id && (
                                                <Form method="post" className="inline" onSubmit={(e) => { if (!confirm("Delete user?")) e.preventDefault(); }}>
                                                    <input type="hidden" name="id" value={u.id} />
                                                    <button type="submit" name="_action" value="delete" className="p-2 hover:text-red-600 transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </Form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">{editingUser ? "Edit User" : "Add New User"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-base-200">
                                <X className="w-5 h-5 opacity-50" />
                            </button>
                        </div>

                        <Form method="post" className="space-y-4" onSubmit={() => setShowModal(false)}>
                            <input type="hidden" name="id" value={editingUser?.id || ""} />
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                                <input name="name" type="text" className="input input-bordered w-full" defaultValue={editingUser?.name || ""} placeholder="John Doe" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                                <input name="email" type="email" className="input input-bordered w-full" defaultValue={editingUser?.email || ""} placeholder="john@example.com" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Password {editingUser && <span className="text-[10px] opacity-50">(Leave blank to keep current)</span>}</label>
                                <input name="password" type="password" className="input input-bordered w-full" placeholder={editingUser ? "••••••••" : "Default: user123"} required={!editingUser} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Role</label>
                                <select name="role" className="select select-bordered w-full" defaultValue={editingUser?.role || "user"}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Cancel</button>
                                <button type="submit" name="_action" value={editingUser ? "edit" : "create"} className="btn-army flex-1 justify-center">
                                    <Check className="w-4 h-4" />
                                    {editingUser ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
