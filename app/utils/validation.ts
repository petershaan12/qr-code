export const validateSocialLink = (platform: string, url: string): boolean => {
  if (!url) return true; // Empty is fine, but if provided it must match

  // Convert to lowercase for easier comparison
  const lowerUrl = url.toLowerCase();

  switch (platform) {
    case "Instagram":
      return lowerUrl.includes("https://instagram");
    case "Facebook":
      return lowerUrl.includes("https://facebook");
    case "Twitter":
      return (
        lowerUrl.includes("https://twitter") || lowerUrl.includes("https://x")
      );
    case "LinkedIn":
      return lowerUrl.includes("https://linkedin");
    case "YouTube":
      return (
        lowerUrl.includes("https://youtube") ||
        lowerUrl.includes("https://youtu")
      );
    case "TikTok":
      return lowerUrl.includes("https://tiktok");
    case "Pinterest":
      return lowerUrl.includes("https://pinterest");
    case "WhatsApp":
      return (
        lowerUrl.includes("https://wa.me") ||
        lowerUrl.includes("https://whatsapp")
      );
    case "Website":
      return lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://");
    default:
      return true;
  }
};

export const getPlatformPlaceholder = (platform: string): string => {
  switch (platform) {
    case "Instagram":
      return "https://instagram.com/username";
    case "Facebook":
      return "https://facebook.com/username";
    case "Twitter":
      return "https://twitter.com/username";
    case "LinkedIn":
      return "https://linkedin.com/in/username";
    case "YouTube":
      return "https://youtube.com/@channel";
    case "TikTok":
      return "https://tiktok.com/@username";
    case "Pinterest":
      return "https://pinterest.com/username";
    case "WhatsApp":
      return "https://wa.me/number";
    case "Website":
      return "https://yourwebsite.com";
    default:
      return "Enter your link here";
  }
};
