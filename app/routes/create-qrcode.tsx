import { useState, useEffect } from "react";
import { useLoaderData, Form, useNavigate, useActionData, redirect, useSubmit } from "react-router";
import {
  Upload,
  Plus,
  Check,
  QrCode,
  Copy,
  Share2,
  Trash2,
  Globe,
  Phone,
  Download,
  AlertCircle,
  Link as LinkIcon,
  MessageCircle,
  X as XIcon,
} from "lucide-react";
import { requireUser } from "~/.server/auth";
import DashboardLayout from "~/components/DashboardLayout";
import PhonePreview from "~/components/shared/PhonePreview";
import { socialOptions } from "~/components/shared/SocialIcons";
import { createQRCode, getUserThemes, getUserById, createNotification, getUserNotifications } from "~/services";
import { type PhoneInput, type QRCodeFormData as FormData } from "~/types";

export async function loader({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const themes = await getUserThemes(userId);

  if (themes.length === 0) {
    return redirect("/theme?error=no_themes");
  }

  const user = await getUserById(userId);
  const notifications = await getUserNotifications(userId);
  return { themes, user, notifications };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action !== "create_qrcode") return null;

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const title = formData.get("title") as string;
  const social = formData.get("social_network") as string;
  const themeId = formData.get("theme_id") as string;
  const profileImage = formData.get("profile_image_data") as string;
  const phones = formData.getAll("phones[]") as string[];
  const emails = formData.getAll("emails[]") as string[];

  const qrId = await createQRCode({
    user_id: userId,
    name,
    surname,
    title,
    email: emails[0] || "",
    profile_image: profileImage,
    social_network: social,
    theme_id: parseInt(themeId),
    status: "draft",
    phones,
  });

  await createNotification({
    user_id: userId,
    title: "QR Code Drafted",
    message: `Draft created for "${name} ${surname}".`,
    type: "info"
  });

  return { success: true, qrId };
}

export default function CreateQRCode() {
  const { themes, user, notifications } = useLoaderData<any>();
  const [step, setStep] = useState<number>(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [phoneInputs, setPhoneInputs] = useState<PhoneInput[]>([{ id: 1, value: "" }]);
  const [emailInputs, setEmailInputs] = useState<string[]>([""]);
  const [selectedSocial, setSelectedSocial] = useState<string>("Instagram");
  const [error, setError] = useState<string | null>(null);

  const actionData = useActionData<any>();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success) {
      setStep(3);
    }
  }, [actionData]);

  const submit = useSubmit();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    title: "",
    email: "",
    social_network: "{}",
    theme_id: themes[0]?.id || "",
  });

  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [currentSocialValue, setCurrentSocialValue] = useState("");

  useEffect(() => {
    setFormData(prev => ({ ...prev, social_network: JSON.stringify(socialLinks) }));
  }, [socialLinks]);

  const selectedTheme =
    themes.find((t: any) => String(t.id) === String(formData.theme_id)) || themes[0];

  const primaryColor = selectedTheme?.primary_color || "#dc2626";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (!formData.name.trim() || !formData.surname.trim() || !formData.title.trim()) {
      setError("First Name, Last Name, and Job Title are required.");
      return;
    }
    const hasPhone = phoneInputs.some(p => p.value.trim() !== "");
    const hasEmail = emailInputs.some(e => e.trim() !== "");
    if (!hasPhone && !hasEmail) {
      setError("At least one Phone Number or Email is required.");
      return;
    }
    setError(null);
    setStep(2);
  };

  return (
    <DashboardLayout
      title="Create QR Code"
      subtitle="Build your digital identity"
      user={user as any}
      notifications={notifications}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Content (3/4) */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${step >= 1 ? "bg-base-100 shadow-sm border-[#dc2626] text-[#dc2626]" : "border-base-300 text-base-content/30"}`}
              >
                1
              </div>
              <div className="w-12 h-[2px] bg-base-300" />
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${step >= 2 ? "bg-base-100 shadow-sm border-[#dc2626] text-[#dc2626]" : "border-base-300 text-base-content/30"}`}
              >
                2
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost font-bold">
                  Back
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-army px-6"
                >
                  Continue
                </button>
              ) : step === 2 ? (
                <button
                  form="create-form"
                  type="submit"
                  name="_action"
                  value="create_qrcode"
                  className="btn-army px-6"
                >
                  <Check className="w-4 h-4" />
                  Publish QR Code
                </button>
              ) : null}
            </div>
          </div>

          <Form
            id="create-form"
            method="post"
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="profile_image_data" value={profileImage || ""} />
            <input type="hidden" name="social_network" value={formData.social_network} />

            {/* Ensure all values are submitted even when unmounted in step 2 */}
            {step !== 1 && (
              <>
                <input type="hidden" name="name" value={formData.name} />
                <input type="hidden" name="surname" value={formData.surname} />
                <input type="hidden" name="title" value={formData.title} />
                <input type="hidden" name="theme_id" value={formData.theme_id} />
                {phoneInputs.map((p, i) => (
                  <input key={`hphone-${i}`} type="hidden" name="phones[]" value={p.value} />
                ))}
                {emailInputs.map((e, i) => (
                  <input key={`hemail-${i}`} type="hidden" name="emails[]" value={e} />
                ))}
              </>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                {error && (
                  <div className="alert alert-error font-bold rounded-lg text- t">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}


                {/* Section: Select Theme */}
                <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-base-300 bg-base-200/50">
                    <h3 className="font-bold text-base-content">Theme Style</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {themes.map((t: any) => (
                        <label
                          key={t.id}
                          className={`cursor-pointer group relative rounded-lg border-2 p-1 transition-all ${formData.theme_id == t.id ? "" : "border-base-300 bg-base-200/20"}`}
                          style={formData.theme_id == t.id ? { borderColor: t.primary_color, backgroundColor: `${t.primary_color}08` } : {}}
                        >
                          <input
                            type="radio"
                            name="theme_id"
                            value={t.id}
                            className="hidden"
                            checked={String(formData.theme_id) === String(t.id)}
                            onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
                          />
                          <div className="p-4 flex flex-col items-center">
                            <span className={`font-bold mb-3 ${formData.theme_id == t.id ? "text-base-content" : "text-base-content/40"}`}>{t.name}</span>
                            <div className="w-5 h-5 rounded-full border-2 border-base-100 ring-2 ring-base-300" style={{ backgroundColor: t.primary_color }} />
                          </div>
                          {formData.theme_id == t.id && (
                            <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full text-white shadow-md animate-in zoom-in" style={{ backgroundColor: t.primary_color }}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section: Basic Information */}
                <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-base-300 bg-base-200/50">
                    <h3 className="font-bold text-base-content">Personal Details</h3>
                  </div>

                  <div className="p-6 space-y-3">
                    {/* Photo Upload */}
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        {profileImage ? (
                          <img src={profileImage} className="w-20 h-20 rounded-lg object-cover ring-2 ring-base-300 shadow-sm" alt="Preview" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-base-200 flex items-center justify-center border-2 border-dashed border-base-300">
                            <Upload className="w-6 h-6 text-base-content/20" />
                          </div>
                        )}
                        <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-base-100 text-base-content shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all border border-base-300">
                          <Plus className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">Profile Picture</p>
                        <p className="text-sm text-base-content/50">PNG or JPG, square recommended</p>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text font-bold text-base-content/70">First Name <span className="text-error font-normal">*</span></span>
                        </label>
                        <input
                          name="name"
                          type="text"
                          className="input input-bordered w-full font-medium"
                          placeholder="Your first name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text font-bold text-base-content/70">Last Name</span>
                        </label>
                        <input
                          name="surname"
                          type="text"
                          className="input input-bordered w-full font-medium"
                          placeholder="Your last name"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-bold text-base-content/70">Job Title</span>
                      </label>
                      <input
                        name="title"
                        type="text"
                        className="input input-bordered w-full font-medium"
                        placeholder="CEO / Consultant / Freelancer"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    {/* Dynamic Phones */}
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">Phone Numbers</span>
                      </label>
                      {phoneInputs.map((p, idx) => (
                        <div key={p.id} className="flex gap-2">
                          <div className="join w-full">
                            <div className="join-item bg-base-200 border border-base-300 flex items-center px-4">
                              <Phone className="w-4 h-4 text-base-content/30" />
                            </div>
                            <input
                              name="phones[]"
                              type="tel"
                              className="input input-bordered join-item flex-1 font-medium"
                              placeholder="+123 456 789"
                              value={p.value}
                              onChange={(e) => {
                                const newPhones = [...phoneInputs];
                                newPhones[idx].value = e.target.value;
                                setPhoneInputs(newPhones);
                              }}
                            />
                          </div>
                          {idx === phoneInputs.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setPhoneInputs([...phoneInputs, { id: Date.now(), value: "" }])}
                              className="btn btn-square"
                              style={{ backgroundColor: primaryColor, color: 'white', border: 'none' }}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPhoneInputs(phoneInputs.filter(item => item.id !== p.id))}
                              className="btn btn-ghost btn-square text-error"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">Emails</span>
                      </label>
                      {emailInputs.map((email, idx) => (
                        <div key={idx} className="flex gap-2">
                          <div className="join w-full">
                            <div className="join-item bg-base-200 border border-base-300 flex items-center px-4">
                              <MessageCircle className="w-4 h-4 text-base-content/30" />
                            </div>
                            <input
                              name="emails[]"
                              type="email"
                              className="input input-bordered join-item flex-1 font-medium"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => {
                                const newEmails = [...emailInputs];
                                newEmails[idx] = e.target.value;
                                setEmailInputs(newEmails);
                              }}
                            />
                          </div>
                          {idx === emailInputs.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setEmailInputs([...emailInputs, ""])}
                              className="btn btn-square"
                              style={{ backgroundColor: primaryColor, color: 'white', border: 'none' }}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEmailInputs(emailInputs.filter((_, i) => i !== idx))}
                              className="btn btn-ghost btn-square text-error"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Website — now part of contact info */}
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">Website</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="join w-full">
                          <div className="join-item bg-base-200 border border-base-300 flex items-center px-4">
                            <Globe className="w-4 h-4 text-base-content/30" />
                          </div>
                          <input
                            type="text"
                            className="input input-bordered join-item flex-1 font-medium"
                            placeholder="https://yourwebsite.com"
                            value={socialLinks['Website'] || ''}
                            onChange={(e) => setSocialLinks(prev => ({ ...prev, Website: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section: Digital Content */}
                <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-base-300 bg-base-200/50">
                    <h3 className="font-bold text-base-content">Social Links</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {socialOptions.map((social) => (
                        <button
                          key={social.name}
                          type="button"
                          onClick={() => {
                            setSelectedSocial(social.name);
                            setCurrentSocialValue(socialLinks[social.name] || "");
                          }}
                          className={`btn btn-sm gap-2 font-bold normal-case rounded-lg border-2 ${selectedSocial === social.name ? 'border-primary bg-primary/5' : 'btn-ghost border-transparent'}`}
                          style={selectedSocial === social.name ? { borderColor: primaryColor } : {}}
                        >
                          <img src={social.icon} alt={social.name} className="w-5 h-5 object-contain" />
                          {social.name}
                        </button>
                      ))}
                    </div>

                    <div className="form-control">
                      <div className="join w-full shadow-sm">
                        <div className="join-item bg-base-200 border border-base-300 px-4 flex items-center">
                          <LinkIcon className="w-4 h-4 text-base-content/30" />
                        </div>
                        <input
                          type="text"
                          className="input input-bordered join-item flex-1 font-medium"
                          placeholder={`Enter your ${selectedSocial} link`}
                          value={currentSocialValue}
                          onChange={(e) => {
                            setCurrentSocialValue(e.target.value);
                            setSocialLinks(prev => ({ ...prev, [selectedSocial]: e.target.value }));
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-base-content/40 mt-2 font-medium italic">
                        Select a platform above and type your link. It will be added to your profile.
                      </p>
                    </div>

                    {/* Show added links */}
                    {Object.entries(socialLinks).filter(([_, val]) => val).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {Object.entries(socialLinks).filter(([_, val]) => val).map(([key, val]) => {
                          const option = socialOptions.find(o => o.name === key);
                          return (
                            <div key={key} className="badge badge-lg py-4 pl-1 pr-3 gap-2 bg-base-200 border-base-300 rounded-lg group">
                              {option && <img src={option.icon} alt={key} className="w-4 h-4 object-contain" />}
                              <span className="text-xs font-bold text-base-content/70">{key}</span>
                              <button
                                type="button"
                                onClick={() => setSocialLinks(prev => {
                                  const next = { ...prev };
                                  delete next[key];
                                  if (key === selectedSocial) setCurrentSocialValue("");
                                  return next;
                                })}
                                className="hover:text-error transition-colors ml-1"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <input type="hidden" name="social_network" value={formData.social_network} />
                  </div>
                </section>
              </div>
            ) : step === 2 ? (
              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-base-100 border border-base-300 rounded-lg p-10 flex flex-col items-center text-center shadow-lg">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: `${primaryColor}15` }}>
                    <QrCode className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-base-content">QR Code Preview</h3>
                  <p className="text-sm text-base-content/50 font-medium mb-8">Review your digital card before publishing</p>

                  <div className="bg-white p-6 rounded-lg shadow-inner mb-8 border border-base-300">
                    <div className="w-44 h-44 flex items-center justify-center bg-base-100 rounded">
                      <QrCode className="w-20 h-20 opacity-20" />
                    </div>
                  </div>

                  <p className="text-sm text-base-content/70 italic">
                    Images and links will be active after you publish.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6">
                <div className="alert alert-success font-bold rounded-lg shadow-sm">
                  <Check className="w-5 h-5" />
                  QR Code Successfully Created! Redirecting to Dashboard...
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-army w-full rounded-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </Form>
        </div>

        {/* Right Sidebar - Phone Preview (1/4) */}
        <div className="hidden lg:block lg:w-1/4 sticky top-1">
          <div className="flex flex-col items-center space-y-4">
            <PhonePreview
              profileImage={profileImage}
              name={formData.name}
              surname={formData.surname}
              title={formData.title}
              emails={emailInputs}
              phones={phoneInputs}
              socialNetwork={formData.social_network}
              legalInfo={selectedTheme?.legal_info}
              primaryColor={primaryColor}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
