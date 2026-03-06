import React from "react";

interface IconProps {
    className?: string;
    size?: number;
}

const socialIconMap: Record<string, string> = {
    instagram: "/ig.png",
    tiktok: "/tiktok.png",
    facebook: "/facebook.png",
    youtube: "/yt.png",
    pinterest: "/pinterest.png",
};

export const SocialBrandIcon: React.FC<IconProps & { name: string }> = ({ name, className = "", size = 20 }) => {
    const src = socialIconMap[name.toLowerCase()];
    if (!src) return null;
    return (
        <img
            src={src}
            alt={name}
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    );
};

/** Get the brand icon component for a given social platform name */
export const getSocialBrandIcon = (name: string) => {
    const src = socialIconMap[name.toLowerCase()];
    if (!src) return null;

    const BrandIcon: React.FC<IconProps> = ({ className = "", size = 20 }) => (
        <img
            src={src}
            alt={name}
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    );
    BrandIcon.displayName = `${name}Icon`;
    return BrandIcon;
};

/** Social options for form selectors — only social platforms, NOT website */
export const socialOptions = [
    { name: "Instagram", icon: "/ig.png" },
    { name: "TikTok", icon: "/tiktok.png" },
    { name: "Facebook", icon: "/facebook.png" },
    { name: "YouTube", icon: "/yt.png" },
    { name: "Pinterest", icon: "/pinterest.png" },
];
