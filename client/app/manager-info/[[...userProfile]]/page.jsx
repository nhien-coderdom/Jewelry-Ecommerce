"use client";
import { UserProfile } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, memo } from "react";

// Custom icon
const ContactIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={{ width: 16, height: 16 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
};

// Contact form
const ContactForm = memo(function ContactForm() {
  const { user } = useUser();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load user data from Strapi once
  useEffect(() => {
    if (!user || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const fetchData = async () => {
      const strapiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

      try {
        const res = await fetch(`${strapiUrl}/api/sync-clerk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkUserID: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username || user.firstName || "user",
          }),
        });

        const data = await res.json();

        if (data.success && data.user) {
          setPhone(data.user.phone || "");
          setAddress(data.user.address || "");
        }
      } catch (err) {
        console.error("❌ Load error:", err);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(phone))
      return alert("❌ Phone number must be exactly 10 digits!");

    if (!address.trim()) return alert("❌ Please enter your shipping address!");

    setLoading(true);

    try {
      const strapiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

      const res = await fetch(`${strapiUrl}/api/sync-clerk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserID: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username || user.firstName,
          phone,
          address,
        }),
      });

      const result = await res.json();

      if (result.success) alert("✅ Contact info updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating contact info!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600">
          Update your phone number and shipping address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              if (val.length <= 10) setPhone(val);
            }}
            className="border-2 border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-2 focus:ring-teal-500"
            placeholder="Enter 10 digits (e.g., 0912345678)"
            autoComplete="tel"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Shipping Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
            className="border-2 border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-2 focus:ring-teal-500 resize-none"
            placeholder="Enter full address"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>
      </form>
    </div>
  );
});

export default function ManagerInfoPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user)
    return <div className="text-white text-center py-10">Loading...</div>;

  return (
    <div
      className="flex justify-center py-10 min-h-screen"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <UserProfile
        path="/manager-info"
        routing="path"
        appearance={{
          elements: {
            rootBox: "w-full max-w-4xl",
            card: "shadow-2xl bg-white rounded-xl",
            navbar: "bg-gray-900 border-r border-gray-800",
            navbarButton: "text-gray-300 hover:bg-gray-800 hover:text-white",
            navbarButtonActive: "bg-teal-600 text-white",
          },
        }}
        customPages={[
          {
            id: "contact",
            label: "Contact",
            icon: ContactIcon,
            content: ContactForm,
          },
        ]}
      />
    </div>
  );
}
