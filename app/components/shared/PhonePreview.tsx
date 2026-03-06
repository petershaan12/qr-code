import React from "react";
import { Phone, Mail, Globe, Plus, User } from "lucide-react";

interface PhonePreviewProps {
    profileImage?: string | null;
    name?: string;
    surname?: string;
    title?: string;
    email?: string;
    phones?: Array<{ id?: number | string; value: string }>;
    socialNetwork?: string;
    legalInfo?: string;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({
    profileImage,
    name,
    surname,
    title,
    email,
    phones = [],
    socialNetwork,
    legalInfo,
}) => {
    const displayName = `${name || ""} ${surname || ""}`.trim() || "Full Name";

    return (
        <div className="phone-mockup w-[320px] mx-auto sticky top-8">
            <div className="phone-screen h-[580px] flex flex-col relative bg-white">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6">
                    {/* Header Card */}
                    <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-700 flex flex-col items-center justify-end pb-4 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-2 right-4 w-12 h-12 border-2 border-white rounded-full" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white rounded-full" />
                        </div>

                        <div className="relative z-10 mb-2">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                                    <User className="w-10 h-10 text-white/70" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>

                        <h2 className="relative z-10 text-base font-bold text-white text-center px-4 leading-tight">
                            {displayName}
                        </h2>
                        <p className="relative z-10 text-red-100 text-[10px] italic mt-0.5">
                            {title || "Position Title"}
                        </p>
                    </div>

                    <div className="px-5 py-4">
                        <button className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-full mb-5 flex items-center justify-center gap-2 shadow-sm text-xs">
                            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            Add Contact
                        </button>

                        <div className="space-y-4">
                            {phones.map((phone, i) => (
                                <div key={phone.id || i} className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-3 h-3 text-red-600" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-800 uppercase tracking-wider">Phone</p>
                                        <p className="text-xs text-gray-500 truncate w-44">{phone.value || "+00 000 000 000"}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <Mail className="w-3 h-3 text-red-600" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-800 uppercase tracking-wider">Email</p>
                                    <p className="text-xs text-gray-500 truncate w-44">{email || "email@example.com"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                    <Globe className="w-3 h-3 text-red-600" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-800 uppercase tracking-wider">Website</p>
                                    <p className="text-xs text-gray-500 truncate w-44">{socialNetwork || "www.example.com"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-2.5 mt-6 pb-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                                    <span className="text-xs">{i === 0 ? "📷" : i === 1 ? "🎵" : "🎬"}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                            <p className="text-[8px] text-gray-400">
                                {legalInfo || "© 2024 Army Security. All Rights Reserved."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhonePreview;
