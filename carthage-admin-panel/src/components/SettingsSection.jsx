import { useEffect, useState } from "react";
import { apiService } from "../api";
import toast from "react-hot-toast";

const SettingsSection = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
      whatsapp: "",
    },
    contactDetails: {
      phone: "",
      email: "",
      address: "",
      description: "",
    },
    stripe: {
      publicKey: "",
      secretKey: "",
      enabled: false,
    },
    paypal: {
      clientId: "",
      clientSecret: "",
      enabled: false,
    },
    etihadPay: {
      merchantId: "",
      apiKey: "",
      enabled: false,
    },
    smtp: {
      host: "",
      port: 587,
      user: "",
      pass: "",
      secure: false,
      fromEmail: "",
      fromName: "",
    },
    logos: {
      headerLogoLight: "",
      headerLogoDark: "",
      footerLogo: "",
      favicon: "",
    },
    emailTemplates: {
      newBookingAdmin: { subject: "", body: "" },
      newBookingCustomer: { subject: "", body: "" },
      bookingCompleted: { subject: "", body: "" }
    }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSettings();
      if (data) {
        setForm({
          socialLinks: {
            facebook: data.socialLinks?.facebook || "",
            instagram: data.socialLinks?.instagram || "",
            twitter: data.socialLinks?.twitter || "",
            youtube: data.socialLinks?.youtube || "",
            linkedin: data.socialLinks?.linkedin || "",
            whatsapp: data.socialLinks?.whatsapp || "",
          },
          contactDetails: {
            phone: data.contactDetails?.phone || "",
            email: data.contactDetails?.email || "",
            address: data.contactDetails?.address || "",
            description: data.contactDetails?.description || "",
          },
          stripe: {
            publicKey: data.stripe?.publicKey || "",
            secretKey: data.stripe?.secretKey || "",
            enabled: !!data.stripe?.enabled,
          },
          paypal: {
            clientId: data.paypal?.clientId || "",
            clientSecret: data.paypal?.clientSecret || "",
            enabled: !!data.paypal?.enabled,
          },
          etihadPay: {
            merchantId: data.etihadPay?.merchantId || "",
            apiKey: data.etihadPay?.apiKey || "",
            enabled: !!data.etihadPay?.enabled,
          },
          smtp: {
            host: data.smtp?.host || "",
            port: data.smtp?.port || 587,
            user: data.smtp?.user || "",
            pass: data.smtp?.pass || "",
            secure: !!data.smtp?.secure,
            fromEmail: data.smtp?.fromEmail || "",
            fromName: data.smtp?.fromName || "",
          },
          logos: {
            headerLogoLight: data.logos?.headerLogoLight || "",
            headerLogoDark: data.logos?.headerLogoDark || "",
            footerLogo: data.logos?.footerLogo || "",
            favicon: data.logos?.favicon || "",
          },
          emailTemplates: {
            newBookingAdmin: {
              subject: data.emailTemplates?.newBookingAdmin?.subject || "",
              body: data.emailTemplates?.newBookingAdmin?.body || "",
            },
            newBookingCustomer: {
              subject: data.emailTemplates?.newBookingCustomer?.subject || "",
              body: data.emailTemplates?.newBookingCustomer?.body || "",
            },
            bookingCompleted: {
              subject: data.emailTemplates?.bookingCompleted?.subject || "",
              body: data.emailTemplates?.bookingCompleted?.body || "",
            }
          }
        });
      }
    } catch (err) {
      toast.error(`Failed to load settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSocialChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value,
      },
    }));
  };

  const handleContactChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        [key]: value,
      },
    }));
  };

  const handleSmtpChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        [key]: value,
      },
    }));
  };

  const handleTemplateChange = (templateName, key, value) => {
    setForm((prev) => ({
      ...prev,
      emailTemplates: {
        ...prev.emailTemplates,
        [templateName]: {
          ...prev.emailTemplates[templateName],
          [key]: value
        }
      }
    }));
  };

  const handleLogoUpload = async (key, file) => {
    if (!file) return;
    const toastId = toast.loading("Uploading logo asset...");
    try {
      const imageUrl = await apiService.uploadImage(file);
      setForm((prev) => ({
        ...prev,
        logos: {
          ...prev.logos,
          [key]: imageUrl,
        },
      }));
      toast.success("Logo uploaded successfully!", { id: toastId });
    } catch (err) {
      toast.error(`Logo upload failed: ${err.message}`, { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.updateSettings(form);
      toast.success("All settings saved successfully!");
    } catch (err) {
      toast.error(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Logos & Assets Uploader */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider border-b pb-2">Website Branding Logos</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "headerLogoLight", label: "Header Logo (Light Background)" },
              { key: "headerLogoDark", label: "Header Logo (Dark Background)" },
              { key: "footerLogo", label: "Footer Logo" },
              { key: "favicon", label: "Favicon Icon" }
            ].map((item) => (
              <div key={item.key} className="flex flex-col gap-2 p-3 border rounded-xl bg-surface-50/50">
                <span className="text-[10px] font-bold text-surface-500 uppercase">{item.label}</span>
                {form.logos[item.key] ? (
                  <div className="relative w-full h-16 bg-white border rounded overflow-hidden flex items-center justify-center p-2">
                    <img src={form.logos[item.key]} alt="" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, logos: { ...prev.logos, [item.key]: "" } }))}
                      className="absolute top-1 right-1 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(item.key, e.target.files[0])}
                    className="w-full text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SMTP Configuration */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider border-b pb-2">SMTP Mail Configuration</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">SMTP Server Host</label>
              <input
                className="input text-xs"
                placeholder="smtp.mailtrap.io"
                value={form.smtp.host}
                onChange={(e) => handleSmtpChange("host", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">SMTP Server Port</label>
              <input
                className="input text-xs"
                type="number"
                placeholder="587"
                value={form.smtp.port}
                onChange={(e) => handleSmtpChange("port", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">SMTP Username</label>
              <input
                className="input text-xs"
                placeholder="Username"
                value={form.smtp.user}
                onChange={(e) => handleSmtpChange("user", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">SMTP Password</label>
              <input
                className="input text-xs"
                type="password"
                placeholder="Password"
                value={form.smtp.pass}
                onChange={(e) => handleSmtpChange("pass", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Sender Email</label>
              <input
                className="input text-xs"
                placeholder="noreply@carthagetravel.com"
                value={form.smtp.fromEmail}
                onChange={(e) => handleSmtpChange("fromEmail", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Sender Name</label>
              <input
                className="input text-xs"
                placeholder="Carthage Notifications"
                value={form.smtp.fromName}
                onChange={(e) => handleSmtpChange("fromName", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="smtp_secure"
              checked={form.smtp.secure}
              onChange={(e) => handleSmtpChange("secure", e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="smtp_secure" className="text-xs font-semibold text-surface-700">SSL/TLS Secure</label>
          </div>
        </div>

        {/* Custom Notification Email Templates */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider border-b pb-2">Custom Email Templates</h3>
          <div className="space-y-4">
            {[
              { key: "newBookingCustomer", label: "New Booking Made (Customer Copy)", tokens: "{{bookingId}}, {{customerName}}, {{totalAmount}}, {{paymentMethod}}" },
              { key: "newBookingAdmin", label: "New Booking Made (Admin Notification)", tokens: "{{bookingId}}, {{customerName}}, {{totalAmount}}, {{paymentMethod}}" },
              { key: "bookingCompleted", label: "Booking Status Marked Completed", tokens: "{{bookingId}}, {{customerName}}, {{totalAmount}}" }
            ].map((tmpl) => (
              <div key={tmpl.key} className="p-4 border rounded-xl bg-surface-50/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-surface-800">{tmpl.label}</span>
                  <span className="text-[9px] text-surface-400 font-semibold bg-white border px-2 py-0.5 rounded">
                    Tokens: {tmpl.tokens}
                  </span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Subject Line"
                    value={form.emailTemplates[tmpl.key]?.subject || ""}
                    onChange={(e) => handleTemplateChange(tmpl.key, "subject", e.target.value)}
                    className="w-full bg-white border border-surface-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                  <textarea
                    placeholder="Email Body Content"
                    value={form.emailTemplates[tmpl.key]?.body || ""}
                    onChange={(e) => handleTemplateChange(tmpl.key, "body", e.target.value)}
                    rows="4"
                    className="w-full bg-white border border-surface-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider border-b pb-2">Company Contact Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Contact Phone</label>
              <input
                className="input text-xs"
                placeholder="Phone number"
                value={form.contactDetails.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Support Email</label>
              <input
                className="input text-xs"
                placeholder="Email address"
                value={form.contactDetails.email}
                onChange={(e) => handleContactChange("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Office Address</label>
              <input
                className="input text-xs"
                placeholder="Address"
                value={form.contactDetails.address}
                onChange={(e) => handleContactChange("address", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Short Description</label>
              <textarea
                className="input text-xs h-10"
                placeholder="Footer details"
                value={form.contactDetails.description}
                onChange={(e) => handleContactChange("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider border-b pb-2">Social Channels Links</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(form.socialLinks).map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-surface-500 capitalize">{key}</label>
                <input
                  className="input text-xs"
                  placeholder={`${key} URL`}
                  value={form.socialLinks[key]}
                  onChange={(e) => handleSocialChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gateways Settings */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider border-b pb-2">Payment Gateways API Keys</h3>
          <div className="grid gap-4 sm:grid-cols-1">
            
            {/* Stripe Setup */}
            <div className="p-4 border border-surface-200 rounded-xl bg-surface-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-surface-700 uppercase">Stripe Gateway Keys</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.stripe.enabled}
                    onChange={(e) => setForm(prev => ({ ...prev, stripe: { ...prev.stripe, enabled: e.target.checked } }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-surface-600">Enable Stripe</span>
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-500">Public Key</label>
                  <input
                    className="input bg-white text-xs"
                    placeholder="pk_test_..."
                    value={form.stripe.publicKey}
                    onChange={(e) => setForm(prev => ({ ...prev, stripe: { ...prev.stripe, publicKey: e.target.value } }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-500">Secret Key</label>
                  <input
                    className="input bg-white text-xs"
                    type="password"
                    placeholder="sk_test_..."
                    value={form.stripe.secretKey}
                    onChange={(e) => setForm(prev => ({ ...prev, stripe: { ...prev.stripe, secretKey: e.target.value } }))}
                  />
                </div>
              </div>
            </div>

            {/* PayPal Setup */}
            <div className="p-4 border border-surface-200 rounded-xl bg-surface-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-surface-700 uppercase">PayPal Gateway Keys</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.paypal.enabled}
                    onChange={(e) => setForm(prev => ({ ...prev, paypal: { ...prev.paypal, enabled: e.target.checked } }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-surface-600">Enable PayPal</span>
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-500">Client ID</label>
                  <input
                    className="input bg-white text-xs"
                    placeholder="Client ID"
                    value={form.paypal.clientId}
                    onChange={(e) => setForm(prev => ({ ...prev, paypal: { ...prev.paypal, clientId: e.target.value } }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-500">Client Secret</label>
                  <input
                    className="input bg-white text-xs"
                    type="password"
                    placeholder="Client Secret"
                    value={form.paypal.clientSecret}
                    onChange={(e) => setForm(prev => ({ ...prev, paypal: { ...prev.paypal, clientSecret: e.target.value } }))}
                  />
                </div>
              </div>
            </div>

            {/* Etihad Pay Setup */}
            <div className="p-4 border border-surface-200 rounded-xl bg-surface-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-surface-700 uppercase">Etihad Guest Pay Gateway</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.etihadPay.enabled}
                    onChange={(e) => setForm(prev => ({ ...prev, etihadPay: { ...prev.etihadPay, enabled: e.target.checked } }))}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-surface-600">Enable Etihad Pay</span>
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-500">Merchant ID</label>
                  <input
                    className="input bg-white text-xs"
                    placeholder="Merchant ID"
                    value={form.etihadPay.merchantId}
                    onChange={(e) => setForm(prev => ({ ...prev, etihadPay: { ...prev.etihadPay, merchantId: e.target.value } }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-surface-500">API Key / Secret Key</label>
                  <input
                    className="input bg-white text-xs"
                    type="password"
                    placeholder="API Key"
                    value={form.etihadPay.apiKey}
                    onChange={(e) => setForm(prev => ({ ...prev, etihadPay: { ...prev.etihadPay, apiKey: e.target.value } }))}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex justify-end">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving settings..." : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SettingsSection;
