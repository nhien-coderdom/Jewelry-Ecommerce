// _services/UserApi.js
const API_BASE = process.env.NEXT_PUBLIC_STRAPI_URL;

/**
 * 🟢 Lấy danh sách order của user
 */
export async function getUserOrders(clerkUserId) {
  const res = await fetch(`${API_BASE}/api/orders?clerkUserId=${clerkUserId}`);
  if (!res.ok) throw new Error("Failed to fetch user orders");
  return res.json();
}

/**
 * 🟢 Lấy một order cụ thể theo ID và clerkUserId
 */
export async function getUserOrderById(clerkUserId, orderId) {
  const res = await fetch(
    `${API_BASE}/api/orders/${orderId}?clerkUserId=${clerkUserId}`
  );
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

/**
 * 🟢 Lấy profile user từ Strapi
 */
export async function getUserProfile(clerkUserId) {
  const res = await fetch(
    `${API_BASE}/api/profiles?filters[clerkUserId][$eq]=${clerkUserId}&populate=*`
  );
  if (!res.ok) throw new Error("Failed to fetch user profile");
  const data = await res.json();
  return data?.data?.[0] || null; // trả về profile đầu tiên
}

/**
 * 🟢 Tạo hoặc cập nhật profile user trong Strapi
 */
export async function upsertUserProfile(profileData) {
  const { clerkUserId } = profileData;

  // Kiểm tra profile có tồn tại chưa
  const existing = await getUserProfile(clerkUserId);

  if (existing) {
    // Update
    const res = await fetch(`${API_BASE}/api/profiles/${existing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: profileData }),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
  } else {
    // Create
    const res = await fetch(`${API_BASE}/api/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: profileData }),
    });
    if (!res.ok) throw new Error("Failed to create profile");
    return res.json();
  }
}
