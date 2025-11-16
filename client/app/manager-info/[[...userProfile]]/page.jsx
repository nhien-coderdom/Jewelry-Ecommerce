"use client";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, memo } from "react";

// ✅ Separate form, memoized — won't re-render unnecessarily
const ContactForm = memo(function ContactForm({ user }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load user info once
  useEffect(() => {
    if (!user || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const fetchData = async () => {
      const strapiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
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
    if (!/^[0-9]{10}$/.test(phone)) return alert("❌ Phone number must be exactly 10 digits!");
    if (!address.trim()) return alert("❌ Please enter your shipping address!");

    setLoading(true);
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
        <p className="text-gray-600">Update your phone number and shipping address.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Shipping Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
            className="border-2 border-gray-300 rounded-lg w-full p-3 text-gray-900 focus:ring-2 focus:ring-teal-500 resize-none"
            placeholder="Enter full address (house number, street, ward, district, city)"
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
    <div className="flex justify-center py-10 min-h-screen" style={{ backgroundColor: "#1a1a1a" }}>
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

      //  ẨN PHONE NUMBER CHÍNH XÁC
      profileSection__phoneNumbers: "hidden",
      profileSection__phoneNumbersList: "hidden",
      profileSection__phoneNumber: "hidden",
      addPhoneNumberButton: "hidden",
      phoneNumberInput: "hidden",
    },
  }}
>

        <UserProfile.Page label="Contact" url="contact" labelIcon="📞">
          <ContactForm user={user} />
        </UserProfile.Page>


        

      </UserProfile>
    </div>
  );
}
