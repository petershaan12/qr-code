import { useLoaderData } from "react-router";
import { User, Phone, Mail, Globe, Plus, QrCode as QrCodeIcon, Copy, Share2, Download } from "lucide-react";
import { getDb } from "~/.server/db";
import type { Route } from "./+types/public-card";

export async function loader({ params }: Route.LoaderArgs) {
    const db = getDb();
    const [qrcodes]: any = await db.query(`
    SELECT q.*, t.primary_color, t.legal_info
    FROM qrcodes q
    LEFT JOIN themes t ON q.theme_id = t.id
    WHERE q.id = ?
  `, [params.id]);

    if (qrcodes.length === 0) {
        throw new Response("Not Found", { status: 404 });
    }

    const [phones]: any = await db.query("SELECT phone as value FROM qrcode_phones WHERE qrcode_id = ?", [params.id]);

    await db.query("UPDATE qrcodes SET scans = scans + 1 WHERE id = ?", [params.id]);

    return { qr: qrcodes[0], phones: phones as Array<{ value: string }> };
}

export default function PublicCard() {
    const { qr, phones } = useLoaderData<typeof loader>();
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-2 md:p-4">
            <div className="w-full max-w-sm bg-base-100 rounded-2xl overflow-hidden shadow-xl">
                <div
                    className="relative h-48 flex flex-col items-center justify-end pb-4 overflow-hidden"
                    style={{ background: `linear-gradient(to bottom right, ${qr.primary_color || '#DC2626'}, ${qr.primary_color || '#991B1B'}E6)` }}
                >
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full" />
                        <div className="absolute bottom-6 left-4 w-10 h-10 border-2 border-white rounded-full" />
                    </div>

                    <div className="relative z-10 mb-2">
                        {qr.profile_image ? (
                            <img src={qr.profile_image} className="w-20 h-20 rounded-full border-3 border-white object-cover shadow-lg" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-white/20 border-3 border-white flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-white/70" />
                            </div>
                        )}
                    </div>

                    <h1 className="relative z-10 text-lg font-bold text-white text-center px-2">{displayName}</h1>
                    <p className="relative z-10 text-white/90 text-xs mt-0.5">{qr.title}</p>
                </div>

                <div className="px-4 py-4 space-y-3">
                    <button className="w-full py-2.5 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-wide">
                        <Plus className="w-3 h-3" strokeWidth={3} />
                        Save to Contacts
                    </button>

                    <div className="space-y-3">
                        {phones.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Phone className="w-3 h-3" />
                                </div>
                                <a href={`tel:${p.value}`} className="flex-1 text-xs font-medium hover:text-red-600 transition-colors">{p.value}</a>
                            </div>
                        ))}

                        {qr.email && (
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Mail className="w-3 h-3" />
                                </div>
                                <a href={`mailto:${qr.email}`} className="flex-1 text-xs font-medium hover:text-red-600 transition-colors">{qr.email}</a>
                            </div>
                        )}

                        {qr.social_network && (
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Globe className="w-3 h-3" />
                                </div>
                                <a href={qr.social_network.startsWith('http') ? qr.social_network : `https://${qr.social_network}`} target="_blank" className="flex-1 text-xs font-medium hover:text-red-600 transition-colors truncate">{qr.social_network}</a>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-2 pt-2">
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer text-xs">📸</button>
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer text-xs">🎵</button>
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer text-xs">🎬</button>
                    </div>

                    <div className="pt-3 border-t border-base-200 flex justify-between items-center">
                        <div className="flex gap-1">
                            <button className="p-2 rounded-lg hover:bg-base-200 transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-base-200 transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-base-200 transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <QrCodeIcon className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>

                    <div className="text-center pt-2 border-t border-base-200">
                        <p className="text-[8px] opacity-50 uppercase font-black tracking-wider">{qr.legal_info}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}