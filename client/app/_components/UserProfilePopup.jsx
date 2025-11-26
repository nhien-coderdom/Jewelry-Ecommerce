"use client";

import React, { useState } from "react";

const UserProfilePopup = ({ onClose, userData, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const updatedData = {};
    if (form.username.trim()) updatedData.username = form.username.trim();
    else updatedData.username = userData?.username || "";
    
    if (form.phone.trim()) updatedData.phone = form.phone.trim();
    else updatedData.phone = userData?.phone || "";
    
    if (form.address.trim()) updatedData.address = form.address.trim();
    else updatedData.address = userData?.address || "";

    setSaving(true);
    await onSave(updatedData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
              <p className="text-teal-100 text-sm mt-1">Update your account details</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={change}
              placeholder={userData?.username || "No username set"}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Phone Number
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={change}
              placeholder={userData?.phone || "No phone number"}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Shipping Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={change}
              placeholder={userData?.address || "No address set"}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition" 
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePopup;
