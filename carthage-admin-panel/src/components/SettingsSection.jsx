import { useEffect, useState } from "react";
import { apiService } from "../api";
import toast from "react-hot-toast";
import RichTextEditor from "./RichTextEditor";

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
    privacyPolicy: "",
    termsAndConditions: "",
    refundPolicy: "",
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
          privacyPolicy: data.privacyPolicy || "",
          termsAndConditions: data.termsAndConditions || "",
          refundPolicy: data.refundPolicy || "",
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

  const handleEditorChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.updateSettings(form);
      toast.success("Settings updated successfully! ✅");
    } catch (err) {
      toast.error(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="card p-6 flex justify-center items-center">
        <p className="text-surface-500">Loading settings...</p>
      </section>
    );
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-surface-900 border-b pb-2 mb-4">Website Settings & Legal Content</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Social Media Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider border-b pb-1">Social Media Links</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">Facebook URL</label>
              <input
                className="input"
                placeholder="https://facebook.com/..."
                value={form.socialLinks.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">Instagram URL</label>
              <input
                className="input"
                placeholder="https://instagram.com/..."
                value={form.socialLinks.instagram}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">Twitter / X URL</label>
              <input
                className="input"
                placeholder="https://twitter.com/..."
                value={form.socialLinks.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">YouTube URL</label>
              <input
                className="input"
                placeholder="https://youtube.com/..."
                value={form.socialLinks.youtube}
                onChange={(e) => handleSocialChange("youtube", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">LinkedIn URL</label>
              <input
                className="input"
                placeholder="https://linkedin.com/..."
                value={form.socialLinks.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">WhatsApp Number / Link</label>
              <input
                className="input"
                placeholder="https://wa.me/..."
                value={form.socialLinks.whatsapp}
                onChange={(e) => handleSocialChange("whatsapp", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider border-b pb-1">Contact Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">Contact Phone</label>
              <input
                className="input"
                placeholder="+971..."
                value={form.contactDetails.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-surface-500">Contact Email</label>
              <input
                className="input"
                type="email"
                placeholder="info@carthagetravel.com"
                value={form.contactDetails.email}
                onChange={(e) => handleContactChange("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold text-surface-500">Office Address</label>
              <input
                className="input"
                placeholder="Office 123, Burj Khalifa District, Dubai, UAE"
                value={form.contactDetails.address}
                onChange={(e) => handleContactChange("address", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold text-surface-500">Short Description (About Us / Footer)</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Brief description of your agency..."
                value={form.contactDetails.description}
                onChange={(e) => handleContactChange("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway Credentials Setup */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider border-b pb-1 font-sans">Payment Gateways Setup</h3>
          
          {/* Stripe Setup */}
          <div className="p-4 border border-surface-200 rounded-xl bg-surface-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-surface-700 uppercase">Stripe Gateway</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.stripe?.enabled}
                  onChange={(e) => setForm(prev => ({ ...prev, stripe: { ...prev.stripe, enabled: e.target.checked } }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-surface-600">Enable Stripe</span>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Public Key</label>
                <input
                  className="input bg-white text-xs"
                  placeholder="pk_live_..."
                  value={form.stripe?.publicKey}
                  onChange={(e) => setForm(prev => ({ ...prev, stripe: { ...prev.stripe, publicKey: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Secret Key</label>
                <input
                  className="input bg-white text-xs"
                  type="password"
                  placeholder="sk_live_..."
                  value={form.stripe?.secretKey}
                  onChange={(e) => setForm(prev => ({ ...prev, stripe: { ...prev.stripe, secretKey: e.target.value } }))}
                />
              </div>
            </div>
          </div>

          {/* PayPal Setup */}
          <div className="p-4 border border-surface-200 rounded-xl bg-surface-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-surface-700 uppercase">PayPal Gateway</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paypal?.enabled}
                  onChange={(e) => setForm(prev => ({ ...prev, paypal: { ...prev.paypal, enabled: e.target.checked } }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-surface-600">Enable PayPal</span>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Client ID</label>
                <input
                  className="input bg-white text-xs"
                  placeholder="PayPal Client ID"
                  value={form.paypal?.clientId}
                  onChange={(e) => setForm(prev => ({ ...prev, paypal: { ...prev.paypal, clientId: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Client Secret</label>
                <input
                  className="input bg-white text-xs"
                  type="password"
                  placeholder="PayPal Client Secret"
                  value={form.paypal?.clientSecret}
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
                  checked={form.etihadPay?.enabled}
                  onChange={(e) => setForm(prev => ({ ...prev, etihadPay: { ...prev.etihadPay, enabled: e.target.checked } }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-surface-600">Enable Etihad Pay</span>
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Merchant ID</label>
                <input
                  className="input bg-white text-xs"
                  placeholder="Etihad Merchant ID"
                  value={form.etihadPay?.merchantId}
                  onChange={(e) => setForm(prev => ({ ...prev, etihadPay: { ...prev.etihadPay, merchantId: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">API Key / Secret</label>
                <input
                  className="input bg-white text-xs"
                  type="password"
                  placeholder="Etihad API Key"
                  value={form.etihadPay?.apiKey}
                  onChange={(e) => setForm(prev => ({ ...prev, etihadPay: { ...prev.etihadPay, apiKey: e.target.value } }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider">Privacy Policy Content</h3>
          <div className="bg-white rounded-xl overflow-hidden border border-surface-200">
            <RichTextEditor
              value={form.privacyPolicy}
              onChange={(content) => handleEditorChange("privacyPolicy", content)}
              placeholder="Enter Privacy Policy page text..."
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider">Terms & Conditions Content</h3>
          <div className="bg-white rounded-xl overflow-hidden border border-surface-200">
            <RichTextEditor
              value={form.termsAndConditions}
              onChange={(content) => handleEditorChange("termsAndConditions", content)}
              placeholder="Enter Terms & Conditions page text..."
            />
          </div>
        </div>

        {/* Refund & Return Policy */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wider">Refund & Return Policy Content</h3>
          <div className="bg-white rounded-xl overflow-hidden border border-surface-200">
            <RichTextEditor
              value={form.refundPolicy}
              onChange={(content) => handleEditorChange("refundPolicy", content)}
              placeholder="Enter Refund & Return Policy page text..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving settings..." : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SettingsSection;
