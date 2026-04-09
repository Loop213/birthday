import { Ban, BarChart3, Gift, ShieldAlert, Tags, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import api, { extractErrorMessage } from "../api/http.js";

function formatCurrency(amount) {
  return `Rs.${(amount / 100).toFixed(2)}`;
}

function formatDateOnly(value) {
  if (!value) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

const blankCoupon = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 20,
  maxDiscount: 0,
  minOrderAmount: 0,
  usageLimit: 25,
  userUsageLimit: 1,
  expiresAt: "",
  isActive: true
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentWishes, setRecentWishes] = useState([]);
  const [users, setUsers] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState(blankCoupon);
  const [editingCouponId, setEditingCouponId] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    try {
      const [dashboardRes, usersRes, wishesRes, couponsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/wishes"),
        api.get("/coupons")
      ]);

      setStats(dashboardRes.data.data.stats);
      setRecentUsers(dashboardRes.data.data.recentUsers);
      setRecentWishes(dashboardRes.data.data.recentWishes);
      setUsers(usersRes.data.data);
      setWishes(wishesRes.data.data);
      setCoupons(couponsRes.data.data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function toggleUser(userId) {
    try {
      await api.patch(`/admin/users/${userId}/toggle-block`);
      toast.success("User status updated.");
      await loadAdminData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function deleteWish(wishId) {
    try {
      await api.delete(`/admin/wishes/${wishId}`);
      toast.success("Wish moderated and removed.");
      await loadAdminData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function saveCoupon(event) {
    event.preventDefault();

    try {
      const payload = {
        ...couponForm,
        expiresAt: couponForm.expiresAt || null
      };

      if (editingCouponId) {
        await api.put(`/coupons/${editingCouponId}`, payload);
        toast.success("Coupon updated.");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created.");
      }

      setCouponForm(blankCoupon);
      setEditingCouponId("");
      await loadAdminData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function removeCoupon(couponId) {
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success("Coupon deleted.");
      await loadAdminData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  const tabs = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "users", label: "Users", icon: UserRound },
    { value: "coupons", label: "Coupons", icon: Tags },
    { value: "moderation", label: "Moderation", icon: ShieldAlert }
  ];

  return (
    <>
      <Helmet>
        <title>Admin | Birthday Glow</title>
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="badge">Admin control room</span>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Platform analytics, moderation, and growth controls
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tabItem) => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.value}
                type="button"
                onClick={() => setTab(tabItem.value)}
                className={
                  tab === tabItem.value
                    ? "button-primary"
                    : "button-secondary"
                }
              >
                <Icon className="h-4 w-4" />
                {tabItem.label}
              </button>
            );
          })}
        </div>

        {loading || !stats ? (
          <div className="glass-panel mt-6 px-6 py-8 text-white/70">Loading admin data...</div>
        ) : (
          <div className="mt-6 space-y-6">
            {tab === "overview" ? (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Users", stats.totalUsers, UserRound],
                    ["Wish pages", stats.totalWishes, Gift],
                    ["Coupons", stats.totalCoupons, Tags],
                    ["Revenue", formatCurrency(stats.totalRevenue), BarChart3]
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="stat-card">
                      <div className="flex items-center justify-between">
                        <p className="text-sm uppercase tracking-[0.22em] text-white/45">{label}</p>
                        <Icon className="h-5 w-5 text-cyan-200" />
                      </div>
                      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="glass-panel p-6">
                    <h2 className="text-2xl font-semibold text-white">Recent users</h2>
                    <div className="mt-5 space-y-3">
                      {recentUsers.map((user) => (
                        <div key={user._id} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-white/55">{user.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-6">
                    <h2 className="text-2xl font-semibold text-white">Recent wishes</h2>
                    <div className="mt-5 space-y-3">
                      {recentWishes.map((wish) => (
                        <div key={wish._id} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                          <p className="font-semibold text-white">{wish.recipientName}</p>
                          <p className="text-sm text-white/55">
                            by {wish.owner?.name} · {wish.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {tab === "users" ? (
              <div className="glass-panel overflow-hidden">
                <div className="border-b border-white/10 px-6 py-5">
                  <h2 className="text-2xl font-semibold text-white">Manage users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left">
                    <thead className="bg-white/5 text-xs uppercase tracking-[0.22em] text-white/45">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-sm text-white/55">{user.email}</p>
                          </td>
                          <td className="px-6 py-4 text-white/70">{user.role}</td>
                          <td className="px-6 py-4 text-white/70">
                            {user.isBlocked ? "Blocked" : "Active"}
                          </td>
                          <td className="px-6 py-4">
                            {user.role === "admin" ? (
                              <span className="text-sm text-white/40">Protected</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleUser(user._id)}
                                className="button-secondary"
                              >
                                <Ban className="h-4 w-4" />
                                {user.isBlocked ? "Unblock" : "Block"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {tab === "coupons" ? (
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="glass-panel p-6">
                  <h2 className="text-2xl font-semibold text-white">
                    {editingCouponId ? "Edit coupon" : "Create coupon"}
                  </h2>
                  <form onSubmit={saveCoupon} className="mt-6 space-y-4">
                    <label className="space-y-2">
                      <span className="field-label">Coupon code</span>
                      <input
                        className="field-input"
                        value={couponForm.code}
                        onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                        required
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="field-label">Description</span>
                      <input
                        className="field-input"
                        value={couponForm.description}
                        onChange={(event) => setCouponForm((current) => ({ ...current, description: event.target.value }))}
                      />
                    </label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="field-label">Discount type</span>
                        <select
                          className="field-input"
                          value={couponForm.discountType}
                          onChange={(event) => setCouponForm((current) => ({ ...current, discountType: event.target.value }))}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat (paise)</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="field-label">Discount value</span>
                        <input
                          type="number"
                          className="field-input"
                          value={couponForm.discountValue}
                          onChange={(event) => setCouponForm((current) => ({ ...current, discountValue: Number(event.target.value) }))}
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="field-label">Max discount (paise)</span>
                        <input
                          type="number"
                          className="field-input"
                          value={couponForm.maxDiscount}
                          onChange={(event) => setCouponForm((current) => ({ ...current, maxDiscount: Number(event.target.value) }))}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="field-label">Min order amount (paise)</span>
                        <input
                          type="number"
                          className="field-input"
                          value={couponForm.minOrderAmount}
                          onChange={(event) => setCouponForm((current) => ({ ...current, minOrderAmount: Number(event.target.value) }))}
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="field-label">Usage limit</span>
                        <input
                          type="number"
                          className="field-input"
                          value={couponForm.usageLimit}
                          onChange={(event) => setCouponForm((current) => ({ ...current, usageLimit: Number(event.target.value) }))}
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="field-label">User limit</span>
                        <input
                          type="number"
                          className="field-input"
                          value={couponForm.userUsageLimit}
                          onChange={(event) => setCouponForm((current) => ({ ...current, userUsageLimit: Number(event.target.value) }))}
                        />
                      </label>
                    </div>
                    <label className="space-y-2">
                      <span className="field-label">Expires at</span>
                      <input
                        type="date"
                        className="field-input"
                        value={couponForm.expiresAt}
                        onChange={(event) => setCouponForm((current) => ({ ...current, expiresAt: event.target.value }))}
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="button-primary">
                        {editingCouponId ? "Update coupon" : "Create coupon"}
                      </button>
                      {editingCouponId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCouponId("");
                            setCouponForm(blankCoupon);
                          }}
                          className="button-secondary"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </form>
                </div>

                <div className="glass-panel p-6">
                  <h2 className="text-2xl font-semibold text-white">Coupon inventory</h2>
                  <div className="mt-6 space-y-4">
                    {coupons.map((coupon) => (
                      <div key={coupon._id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xl font-semibold text-white">{coupon.code}</p>
                            <p className="mt-1 text-white/55">{coupon.description || "No description"}</p>
                            <p className="mt-3 text-sm text-white/50">
                              Used {coupon.usedCount} / {coupon.usageLimit || "∞"} times
                            </p>
                            <p className="mt-1 text-sm text-white/50">
                              Expires on {formatDateOnly(coupon.expiresAt)}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCouponId(coupon._id);
                                setCouponForm({
                                  code: coupon.code,
                                  description: coupon.description || "",
                                  discountType: coupon.discountType,
                                  discountValue: coupon.discountValue,
                                  maxDiscount: coupon.maxDiscount || 0,
                                  minOrderAmount: coupon.minOrderAmount || 0,
                                  usageLimit: coupon.usageLimit || 0,
                                  userUsageLimit: coupon.userUsageLimit || 1,
                                  isActive: coupon.isActive,
                                  expiresAt: coupon.expiresAt
                                    ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
                                    : ""
                                });
                              }}
                              className="button-secondary"
                            >
                              Edit
                            </button>
                            <button type="button" onClick={() => removeCoupon(coupon._id)} className="button-secondary">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "moderation" ? (
              <div className="glass-panel overflow-hidden">
                <div className="border-b border-white/10 px-6 py-5">
                  <h2 className="text-2xl font-semibold text-white">Content moderation</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left">
                    <thead className="bg-white/5 text-xs uppercase tracking-[0.22em] text-white/45">
                      <tr>
                        <th className="px-6 py-4">Wish</th>
                        <th className="px-6 py-4">Owner</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {wishes.map((wish) => (
                        <tr key={wish._id}>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{wish.recipientName}</p>
                            <p className="text-sm text-white/55 line-clamp-2">{wish.message || "No message"}</p>
                          </td>
                          <td className="px-6 py-4 text-white/70">
                            {wish.owner?.name}
                          </td>
                          <td className="px-6 py-4 text-white/70">{wish.status}</td>
                          <td className="px-6 py-4">
                            <button type="button" onClick={() => deleteWish(wish._id)} className="button-secondary">
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
