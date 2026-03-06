import { useState } from "react";
import { useLoaderData, Form, useNavigate, redirect } from "react-router";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  QrCode,
  User,
  Palette,
} from "lucide-react";
import { getDb } from "~/.server/db";
import { requireUser } from "~/.server/auth";
import PhonePreview from "~/components/shared/PhonePreview";

interface Theme {
  id: number;
  name: string;
  primary_color: string;
  legal_info: string;
}

interface PhoneInput {
  id: number;
  value: string;
}

interface FormData {
  name: string;
  surname: string;
  title: string;
  email: string;
  social_network: string;
  theme_id: number | string;
}

interface LoaderData {
  themes: Theme[];
}

export async function loader({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const db = getDb();
  const [themes] = await db.query(
    "SELECT * FROM themes WHERE user_id = ? OR user_id IS NULL",
    [userId],
  );
  return { themes };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireUser(request);
  const formData = await request.formData();

  const db = getDb();
  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const title = formData.get("title") as string;
  const email = formData.get("email") as string;
  const social = formData.get("social_network") as string;
  const themeId = formData.get("theme_id") as string;
  const profileImage = formData.get("profile_image_data") as string;
  const phones = formData.getAll("phones[]") as string[];

  // Insert QR Code
  const [result] = await db.query(
    "INSERT INTO qrcodes (user_id, name, surname, title, email, social_network, theme_id, status, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)",
    [userId, name, surname, title, email, social, themeId, profileImage],
  );

  const qrId = result.insertId;

  // Insert Phones
  for (const phone of phones) {
    if (phone.trim() !== "") {
      await db.query(
        "INSERT INTO qrcode_phones (qrcode_id, phone) VALUES (?, ?)",
        [qrId, phone],
      );
    }
  }

  return redirect("/dashboard");
}

export default function CreateQRCode() {
  const { themes } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [phoneInputs, setPhoneInputs] = useState<PhoneInput[]>([{ id: 1, value: "" }]);

  // Form State for Preview
  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    title: "",
    email: "",
    social_network: "",
    theme_id: themes[0]?.id || "",
  });

  const selectedTheme =
    themes.find((t) => String(t.id) === String(formData.theme_id)) || themes[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">ArmyQR</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === 1 ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
            >
              {step === 1 ? "1" : <Check className="w-4 h-4" />}
            </div>
            <div className="w-12 h-0.5 bg-base-300" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === 2 ? "bg-red-600 text-white" : "bg-base-300 text-base-content/40"}`}
            >
              2
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="btn-army btn-sm px-6">
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              form="create-form"
              type="submit"
              className="btn-army btn-sm px-6"
            >
              Publish Now <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-12">
          <Form
            id="create-form"
            method="post"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            <input
              type="hidden"
              name="profile_image_data"
              value={profileImage || ""}
            />

            {/* Form Side */}
            <div
              className={`lg:col-span-7 space-y-8 ${step !== 1 ? "hidden lg:block" : ""}`}
            >
              <section className="bg-base-100 rounded-2xl p-8 border border-base-300 shadow-sm transition-all">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-red-600" /> Select Template
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {themes.map((t: Theme) => (
                    <label
                      key={t.id}
                      className={`cursor-pointer group relative p-4 rounded-xl border-2 transition-all ${formData.theme_id == t.id ? "border-red-600 bg-red-50" : "border-base-300 hover:border-red-200"}`}
                    >
                      <input
                        type="radio"
                        name="theme_id"
                        value={t.id}
                        className="hidden"
                        checked={formData.theme_id == t.id}
                        onChange={(e) =>
                          setFormData({ ...formData, theme_id: e.target.value })
                        }
                      />
                      <div
                        className="w-full h-12 rounded-lg mb-3"
                        style={{ backgroundColor: t.primary_color }}
                      />
                      <p className="text-sm font-bold text-center truncate">
                        {t.name}
                      </p>
                      {formData.theme_id == t.id && (
                        <Check className="absolute top-2 right-2 w-4 h-4 text-red-600" />
                      )}
                    </label>
                  ))}
                </div>
              </section>

              <section className="bg-base-100 rounded-2xl p-8 border border-base-300 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600" /> Personal Details
                </h3>

                <div className="flex items-center gap-6 mb-8">
                  <label className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center border-4 border-base-100 overflow-hidden shadow-inner">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-8 h-8 opacity-20" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                      CHANGE
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-1">Profile Photo</p>
                    <p className="text-sm opacity-50">
                      Upload a professional photo for your card. Suggest
                      400x400px.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    name="name"
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="First Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <input
                    name="surname"
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Last Name"
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                  />
                </div>
                <input
                  name="title"
                  type="text"
                  className="input input-bordered w-full mb-4"
                  placeholder="Position / Job Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <input
                  name="email"
                  type="email"
                  className="input input-bordered w-full mb-4"
                  placeholder="Work Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </section>

              <section className="bg-base-100 rounded-2xl p-8 border border-base-300 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  Contact Channels
                </h3>
                <div className="space-y-3 mb-6">
                  {phoneInputs.map((p, idx) => (
                    <div key={p.id} className="flex gap-2">
                      <input
                        name="phones[]"
                        type="tel"
                        className="input input-bordered flex-1"
                        placeholder="Phone Number"
                        value={p.value}
                        onChange={(e) => {
                          const newPhones = [...phoneInputs];
                          newPhones[idx].value = e.target.value;
                          setPhoneInputs(newPhones);
                        }}
                      />
                      {phoneInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPhoneInputs(
                              phoneInputs.filter((item) => item.id !== p.id),
                            )
                          }
                          className="btn btn-square btn-ghost text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setPhoneInputs([
                        ...phoneInputs,
                        { id: Date.now(), value: "" },
                      ])
                    }
                    className="text-red-600 text-sm font-bold flex items-center gap-2 hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add another phone
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-base-300">
                  <div>
                    <label className="text-sm font-bold opacity-50 mb-2 block uppercase tracking-wider">
                      Social / Website
                    </label>
                    <input
                      name="social_network"
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="www.yourcompany.com"
                      value={formData.social_network}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_network: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Preview Side */}
            <div
              className={`lg:col-span-5 flex flex-col items-center py-8 ${step === 1 ? "hidden lg:flex" : ""}`}
            >
              <div className="sticky top-28 w-full flex flex-col items-center">
                <div className="mb-6 text-center">
                  <h4 className="font-bold text-gray-500 text-sm uppercase mb-1">
                    Live Mobile Preview
                  </h4>
                  <p className="text-xs opacity-30 italic">
                    Real-time update based on your data
                  </p>
                </div>

                <PhonePreview
                  profileImage={profileImage}
                  name={formData.name}
                  surname={formData.surname}
                  title={formData.title}
                  email={formData.email}
                  phones={phoneInputs}
                  socialNetwork={formData.social_network}
                  legalInfo={selectedTheme?.legal_info}
                />

                {step === 2 && (
                  <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-2xl max-w-[320px] shadow-sm scale-in-center">
                    <p className="text-blue-700 text-sm font-medium mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Ready to publish!
                    </p>
                    <p className="text-xs text-blue-600 opacity-80 leading-relaxed">
                      Once published, the contact link will be active instantly.
                      Scanning the QR code will direct users to this profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
