import { useLoaderData, Form, useActionData } from "react-router";
import { Save, Camera, Check } from "lucide-react";
import bcrypt from "bcryptjs";
import { getDb } from "@/.server/db";
import { requireUser } from "@/.server/auth";
import DashboardLayout from "@/components/DashboardLayout";
import type { Route } from "./+types/account";

export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUser(request);
    const db = getDb();
    const [users]: any = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [userId]);
    return { user: users[0] };
}

export async function action({ request }: Route.ActionArgs) {
    const userId = await requireUser(request);
    const formData = await request.formData();
    const _action = formData.get("_action");
    const db = getDb();

    if (_action === "profile") {
        const name = formData.get("name");
        const email = formData.get("email");
        await db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
        return { success: true, message: "Profile updated successfully" };
    }

    if (_action === "password") {
        const freshPassword = formData.get("new_password") as string;
        const confirmPassword = formData.get("confirm_password") as string;

        if (freshPassword !== confirmPassword) {
            return { error: "Passwords do not match" };
        }

        const hash = bcrypt.hashSync(freshPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId]);
        return { success: true, message: "Password updated successfully" };
    }

    return null;
}

export default function AccountPage() {
    const { user } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <DashboardLayout title="Account Settings" subtitle="Keep your profile information up to date" user={user}>
            <div className="max-w-2xl space-y-8">
                <div className="bg-base-100 rounded-2xl border border-base-300 p-8 shadow-sm">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center font-bold text-3xl text-red-600">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-base-100">
                                <Camera className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-sm opacity-50 uppercase tracking-wider font-semibold">{user.role}</p>
                        </div>
                    </div>

                    <Form method="post" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                                <input name="name" type="text" className="input input-bordered w-full" defaultValue={user.name} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                                <input name="email" type="email" className="input input-bordered w-full" defaultValue={user.email} required />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-base-300 mt-6">
                            <button type="submit" name="_action" value="profile" className="btn-army">
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                            {actionData && 'success' in actionData && actionData.success && actionData.message?.includes("Profile") && (
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Updated!
                                </span>
                            )}
                        </div>
                    </Form>
                </div>

                <div className="bg-base-100 rounded-2xl border border-base-300 p-8 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Security & Password</h3>
                    <Form method="post" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">New Password</label>
                                <input name="new_password" type="password" className="input input-bordered w-full" placeholder="••••••••" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                                <input name="confirm_password" type="password" className="input input-bordered w-full" placeholder="••••••••" required />
                            </div>
                        </div>

                        {actionData && 'error' in actionData && actionData.error && (
                            <p className="text-red-600 text-xs font-medium">{actionData.error}</p>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-base-300 mt-6">
                            <button type="submit" name="_action" value="password" className="btn btn-outline border-base-300">
                                Update Password
                            </button>
                            {actionData && 'success' in actionData && actionData.success && actionData.message?.includes("Password") && (
                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Saved!
                                </span>
                            )}
                        </div>
                    </Form>
                </div>
            </div>
        </DashboardLayout>
    );
}
