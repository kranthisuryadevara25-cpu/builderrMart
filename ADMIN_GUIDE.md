# BuildMart AI – Admin Guide

This guide explains how to access the admin panel, manage categories and products, and approve vendors.

---

## Super Admin

The account **admin@buildmart.ai** (UID `nOtjfkijQOfz3qg3ObRdtrDFqwE3`) is treated as **Super Admin**: it always has role `owner_admin`, can open the admin panel at **`/admin-dashboard`**, and will get access even if the Firestore user document is missing (the app uses a built-in fallback for this UID).

## Test accounts (testing)

| Role | Email | UID | Purpose |
|------|--------|-----|---------|
| **Manager** | manager@buildmart.ai | `X5Vf2GRrRnQK60kR5cFdtQbuvaI3` | Vendor management (`vendor_manager`) |
| **Vendor** | vendor1@buildmart.ai | `qoiW5CqK4IM4wxz0rCwJd3H8AYZ2` | Product management (`vendor`) |

These UIDs are recognized by the app: they always get the correct role (and access) even if the Firestore user document is missing. Create these users in **Firebase Console → Authentication** with the emails above; after sign-in they will have Manager and Vendor access respectively.

---

## Accessing the admin panel

- **Firebase-backed admin (recommended):** Open **`/admin-dashboard`** in your app (e.g. `https://your-domain.com/admin-dashboard`).
  - You must be **logged in**.
  - Your user must have role **`owner_admin`** or **`vendor_manager`**. Users with role **`user`** are redirected to the home page.
- **Legacy admin:** **`/admin`** loads the “Comprehensive Admin Panel”, which uses the REST API. It will **not** work if your backend is Firebase-only. Use **`/admin-dashboard`** instead.

---

## Product creation – fields available

When creating or editing a product (Admin Dashboard → **Products** tab, or **Products** / **My Products** pages), you can use:

| Field | Required | Description |
|-------|----------|-------------|
| **Name** | Yes | Product name |
| **Category** | Yes | Category from the category tree |
| **Description** | No | Text description |
| **Brand** | No | e.g. UltraTech, ACC; appears in storefront “All brands” filter |
| **Company / Manufacturer** | No | Optional |
| **Grade** | No | e.g. 43, 53, OPC; appears in storefront “All grades” filter (stored in specs) |
| **Base price (₹)** | Yes | List price per unit in INR |
| **Stock quantity** | Yes | Available quantity (number) |
| **Vendor** | Yes (in admin) | Vendor user; on vendor pages it defaults to the logged-in vendor |
| **Discount (%)** | No | Product-level discount 0–100%; selling price = base × (1 − discount/100) if selling price not set |
| **Selling price (₹)** | No | Explicit price per unit; overrides base/discount when set. Leave blank to use base (or base − discount) |
| **GST rate (%)** | No | GST percentage (e.g. 18). Used for exact price calculation |
| **Quantity pricing slabs** | No | Min qty, max qty, price per unit (₹) for volume-based pricing |
| **Bulk discount by quantity** | No | Min quantity and discount % (e.g. 5% off when min qty ≥ 100) |
| **Specific charges** | No | Hamali (per bag), Transportation, Loading, Packing, Unloading, or custom: name, rate (₹), unit |
| **Specifications** | No | Repeatable name/value pairs (e.g. Grade / 43) |
| **Featured / Trending** | No | Flags (in Admin Dashboard product form) |

Together, these fields support **exact price**: base/selling price, discount, quantity slabs, GST, and per-unit or per-trip charges (hamali, transportation, etc.).

---

## Categories

- **Admin Dashboard → Categories tab:** Create, edit, and delete categories. You can set a parent category for a hierarchy.
- **Dedicated Categories page (**`/categories`**):** If your app has this route (protected for admin), you can also:
  - Use **“Seed India categories”** to create the pre-defined India category tree (Cement, Steel, Aggregates, Bricks & Blocks, etc.).
  - Use **“Add Category”** to create categories manually.

---

## Products

- **Admin Dashboard → Products tab:** Create and edit products, assign a **Vendor**, and set **Featured** / **Trending**.
- **Products / My Products pages (**`/products`**,** `/my-products`**):** Use the same product form. Vendors see only their products; admins can manage all products.

### Can admin create products?

**Yes.** In Admin Dashboard → **Products**, use **Add Product** to create a new product. You must choose a **Vendor** (from the dropdown); that vendor will “own” the product. All fields (name, category, price, GST, slabs, charges, brand, grade, etc.) are available.

### Can admin modify or alter products created by vendors?

**Yes.** Admin (and Manager) can **edit or delete any product** in the system, including products created by vendors. In Admin Dashboard → **Products**, the table lists all products; click **Edit** on any row to change name, price, category, vendor, stock, featured/trending, or any other field. The backend does not restrict edits by “who created it”; only by role (owner_admin and vendor_manager can open Admin Dashboard and use the full product list).

---

## Approving vendors

- **Admin Dashboard → Users tab:** Lists all users (from Firestore `users` collection) with **Name**, **Email**, **Role**, **City**, and **Status** (Active/Inactive).
  - For users with role **vendor**, use **Approve** or **Suspend** to set `isActive`. Only **active** vendors appear in the storefront shop list.
- **Firebase Console:** You can also edit the `users` collection in Firestore (e.g. set `role` to `vendor` and `isActive` to `true`) to approve vendors without using the in-app Users tab.

---

## Quick reference

| Task | Where |
|------|--------|
| Open admin (Firebase) | Go to **`/admin-dashboard`** and log in as `owner_admin` or `vendor_manager` |
| Create category | Admin Dashboard → **Categories** → Add / edit |
| Seed India categories | **Categories** page → “Seed India categories” (if route exists) |
| Create / edit product | Admin Dashboard → **Products**, or **Products** / **My Products** |
| Approve / suspend vendor | Admin Dashboard → **Users** → Approve / Suspend for vendor rows |
| Discounts, quotes, bookings | Admin Dashboard → **Discounts**, **Quotes**, **Bookings** tabs |
