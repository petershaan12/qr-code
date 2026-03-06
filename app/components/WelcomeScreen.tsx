import { QrCodeIcon } from "lucide-react";

interface WelcomeScreenProps {
    qr: any;
    showSplash: boolean;
    primaryColor: string;
    displayName: string;
}

export default function WelcomeScreen({ qr, showSplash, primaryColor, displayName }: WelcomeScreenProps) {
    if (!showSplash) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans" data-theme="light">
            <div
                className={`w-full h-screen max-w-sm flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-700 ${showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ backgroundColor: primaryColor }}
            >
                {qr.welcome_image && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={qr.welcome_image}
                            alt="Welcome"
                            className="w-36 h-36 object-cover rounded-lg shadow-lg"
                        />
                        {/* Subtle overlay for branding if needed */}
                        <div className="absolute inset-0 bg-black/5" />

                        <div className="absolute bottom-12">
                            <div className="loading loading-ring loading-lg opacity-50 text-white"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
