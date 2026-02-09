# BuildMart AI – How the Application Works

This guide explains the **roles**, **data**, **routes**, and **features** so you can see how vendors, admin, managers, and users fit together.

---

## 1. What is BuildMart AI?

BuildMart AI is a **B2B/B2C e‑commerce platform for construction materials** (cement, steel, bricks, plumbing, etc.). It has:

- A **public storefront** where anyone can browse and (when logged in) shop
- **Vendors** who list products and fulfill orders
- **Managers** who oversee vendors and operations
- **Admins** who control categories, products, users, and approvals
- **Users (customers)** who browse, compare, get quotes, and place orders

**Backend:** Firebase (Auth + Firestore). All main data (users, products, categories, orders, quotes, etc.) lives in Firestore.

---

## 2. The Four Roles

| Role (in code)   | Who they are              | Main purpose                                      |
|------------------|---------------------------|---------------------------------------------------|
| **user**         | Customer / buyer          | Browse store, add to cart, place orders, get quotes |
| **vendor**       | Seller / supplier         | List products, manage stock, see their orders   |
| **vendor_manager** | Manager / operations   | Manage vendors and products (no full admin)      |
| **owner_admin**  | Super admin               | Full control: categories, products, users, approve vendors |

- Each person has **one role** stored in Firestore (`users` collection, field `role`).
- **Special UIDs** (see ADMIN_GUIDE.md): `admin@buildmart.ai` → always `owner_admin`; test manager/vendor UIDs get `vendor_manager` and `vendor` even if Firestore doc is missing.

---

## 3. Where Each Role Goes (Routes & Sidebar)

### Public (no login)

- **`/`** – Main storefront (customer e‑commerce): search, categories, products, filters (brand, grade, etc.)
- **`/product/:id`** – Product detail
- **`/category/:categoryId`** – Category listing
- **`/profile`** – User profile (may require login for full use)
- **`/login`** – Login / register

### After login – sidebar and routes depend on role

**Sidebar** (see `client/src/components/layout/sidebar.tsx`) shows only items whose `roles` array includes your role:

| Link / Route            | Who sees it                          |
|-------------------------|--------------------------------------|
| Dashboard               | Admin, Manager, Vendor               |
| Admin Panel (`/admin`)  | **Admin only** (legacy REST panel)   |
| **Admin Dashboard** (`/admin-dashboard`) | **Admin + Manager only** (Firebase admin) |
| All Products (`/products`) | Admin, Manager                     |
| Vendor Management (`/vendors`) | **Admin only**                   |
| Vendor Panel (`/vendor-panel`) | **Vendor only**                 |
| My Products (`/my-products`)   | **Vendor only**                 |
| Categories               | Admin, Manager, Vendor               |
| Orders                   | Admin, Manager, Vendor, User          |
| Analytics                | Admin, Manager, Vendor               |
| Advanced Analytics       | All roles                            |
| Voice Demo               | Admin, Manager, Vendor               |
| Inventory                | Admin, Manager, Vendor               |
| Shop (sidebar)           | User/Customer                        |

**Important routing rule (App.tsx):**

- **`/admin-dashboard`** – Only **owner_admin** and **vendor_manager** can open it.  
  - `user` (customer) → redirected to `/`  
  - `vendor` → redirected to `/dashboard`

So:

- **Customers (user)** – Home is the storefront `/`; they don’t see admin/vendor sidebar items; they can go to `/customer` (customer app), `/profile`, `/shop`, etc.
- **Vendors** – Use **Vendor Panel** and **My Products**; no access to Admin Dashboard or Vendor Management.
- **Managers (vendor_manager)** – Use **Admin Dashboard** and **All Products**; no **Vendor Management** (that’s admin-only).
- **Admins (owner_admin)** – Full access: Admin Dashboard, Vendor Management, All Products, Categories, etc.

---

## 4. Data Model (What’s in Firestore)

### Users (`users` collection)

- **id**, **username**, **email**, **role** (`user` | `vendor` | `vendor_manager` | `owner_admin`)
- **isActive** – Used for vendors: only active vendors show in storefront
- Optional: phone, address, city, state, pincode, rating (for vendors), sameDayDelivery, deliverySlots, etc.

### Categories (`categories`)

- **id**, **name**, **description**, **parentId** (for tree), **isActive**
- Used to organize products (e.g. Cement, Steel, Bricks & Blocks).

### Products (`products`)

- **id**, **name**, **categoryId**, **description**, **vendorId** (which user/vendor owns this product)
- **basePrice**, **discountPercent**, **sellingPrice**, **quantitySlabs**, **gstRate**, **dynamicCharges** (e.g. hamali, transport)
- **brand**, **company**, **specs** (e.g. Grade)
- **stockQuantity**, **isFeatured**, **isTrending**, **isActive**
- Products are **always tied to one vendor** via `vendorId`.

### Orders (`orders`)

- **orderNumber**, **customerName**, **customerEmail**, **items**, **subtotal**, **totalAmount**, **status**, **deliveryDate**, etc.
- Orders can reference a **quoteId** and have **createdBy** (user id).

### Other collections

- **Quotes** – Quote requests and totals  
- **Bookings** – Service bookings  
- **Discounts** – Coupon codes / discount rules  
- **Vendor ratings** – Stored separately; aggregated back to `users.rating` for vendors  
- **Marketing materials**, **Contractors**, **Advances**, **Pricing rules** – Used by admin/operations features

---

## 5. How the Main Flows Work

### A. Customer (user) flow

1. **Browse** – Open `/` (customer e‑commerce). See categories, featured/trending products, search, filters (brand, grade, etc.).
2. **Product detail** – Click product → `/product/:id`. See price, specs, add to cart, compare, AI estimator, loyalty, etc.
3. **Cart & checkout** – Cart is in-app state; checkout can create an **order** (and optionally a **quote**).
4. **Profile** – `/profile` for account info.
5. **Customer app** – `/customer` gives a dedicated customer view (cart, wishlist, checkout).
6. **Orders** – From sidebar **Orders** they see their orders (when the app filters by current user).

So: **Users** = people who buy; they only see storefront, cart, orders, profile, and analytics tools they’re allowed (e.g. Advanced Analytics).

### B. Vendor flow

1. **Vendor Panel** – `/vendor-panel`. Tabs: Dashboard, Products (My Products), etc.
2. **My Products** – `/my-products`. List of products where `vendorId === current user id`. Create/edit/delete **their** products only.
3. **Products** are created with **category**, **price**, **stock**, **brand**, **grade**, **GST**, **charges** (hamali, transport, etc.) – same fields as in ADMIN_GUIDE.
4. **Orders** – Vendors see orders (typically those that involve their products; exact filter depends on implementation).
5. **Profile** – Can edit business profile (name, GST, address, etc.) from Vendor Panel.
6. **No access** – Vendors cannot open Admin Dashboard or Vendor Management; they cannot approve other vendors or manage “All Products”.

So: **Vendors** = sellers; they only manage **their** catalog and their part of orders.

### C. Manager (vendor_manager) flow

1. **Admin Dashboard** – `/admin-dashboard` (same UI as for admin, but with fewer responsibilities).
2. **All Products** – Can create/edit products and **assign any vendor** (vendor dropdown). So they manage the **full** product catalog, not just one vendor’s.
3. **Categories** – Can create/edit categories.
4. **Orders, Quotes, Bookings, Discounts** – Can view and manage (tabs in Admin Dashboard).
5. **Users tab** – Can see users; typically **cannot** approve/suspend vendors (that’s often admin-only in the UI; if the UI allows it, they can).
6. **No Vendor Management** – Sidebar has **no** “Vendor Management” link; that route is admin-only.

So: **Managers** = operations; they run the catalog and day‑to‑day ops but don’t manage “who is a vendor” (no Vendor Management).

### D. Admin (owner_admin) flow

1. **Admin Dashboard** – `/admin-dashboard`. Full tabs: Dashboard, Categories, **Products**, **Users**, Discounts, Quotes, Bookings, etc.
2. **Categories** – Create/edit/delete; seed India categories (e.g. from Categories page).
3. **Products** – Create/edit any product, assign **Vendor** (required). Set featured/trending. Same product form as elsewhere (name, category, price, GST, slabs, charges, brand, grade, etc.).
4. **Users** – List all users from Firestore. For **vendor** users: **Approve** / **Suspend** (sets `isActive`). Only **active** vendors appear in the storefront vendor list.
5. **Vendor Management** – `/vendors`. Dedicated page to view vendors, communicate, export, etc. (Admin only.)
6. **Legacy Admin Panel** – `/admin` uses REST API; use for dev if needed. Prefer `/admin-dashboard` for Firebase-backed admin.

So: **Admins** = full control: categories, full product catalog, **vendor approval**, and Vendor Management.

---

## 6. How Data and Features Connect

- **Products** always have a **vendorId** → “who sells this.”  
  - Vendor sees only their products (filter `vendorId === user.id`).  
  - Admin/Manager see all products and can assign vendor when creating/editing.

- **Categories** are global. Admin/Manager/Vendor can create/edit (depending on sidebar). Product form needs a **category** for every product.

- **Vendor approval:** In Admin Dashboard → **Users**, for role **vendor**, “Approve” / “Suspend” toggles **isActive**. Storefront (e.g. shop by vendor) only shows **active** vendors.

- **Orders** are created by customers (or from quotes). They contain **items** (product + qty + price). Vendors see orders; filtering by “my products” is done in the app (e.g. by `vendorId` on product).

- **Quotes / Bookings / Discounts** – Managed from Admin Dashboard (and possibly Manager). Used for B2B flows and promotions.

- **Analytics & Advanced Analytics** – Tools like Material Comparison, Price Heatmap, Sustainability Wizard, Vendor Chat, Budget Calculator, etc. Available to multiple roles (see sidebar). They use products/categories/vendors data for insights.

- **Customer e‑commerce** (`/`) – Reads **categories**, **products** (with filters: category, brand, grade, etc.), **users** (as vendors for “shop by vendor”). Only **active** vendors should appear there.

---

## 7. Quick Reference by Role

| Question | Answer |
|----------|--------|
| Who can approve/suspend vendors? | **Admin** (Admin Dashboard → Users). |
| Who can create categories? | **Admin, Manager, Vendor** (Categories in sidebar). |
| Who can create products? | **Admin & Manager** (all products, any vendor); **Vendor** (only their own, in Vendor Panel / My Products). |
| Who can see “Vendor Management” (/vendors)? | **Admin only.** |
| Who can open Admin Dashboard? | **Admin + Manager** (not Vendor, not Customer). |
| Where do customers shop? | **`/`** (customer e‑commerce) and **`/shop`**, **`/customer`**. |
| Where is product data stored? | Firestore **products** collection; each product has **vendorId**. |
| Why don’t I see a vendor on the storefront? | Check **Users** → that user has role **vendor** and **isActive** = true. |

---

## 8. Summary Diagram (conceptual)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    BuildMart AI                           │
                    │  (Firebase: Auth + Firestore – users, products,         │
                    │   categories, orders, quotes, discounts, …)              │
                    └─────────────────────────────────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
   ┌───────────┐                       ┌───────────┐                         ┌───────────┐
   │  Customer │                       │  Vendor   │                         │  Manager   │
   │  (user)   │                       │ (vendor)  │                         │(vendor_   │
   │           │                       │           │                         │ manager)  │
   │ • Browse /│                       │ • My      │                         │ • Admin   │
   │   shop /  │                       │   Products│                         │   Dashboard│
   │   cart    │                       │ • Vendor  │                         │ • All     │
   │ • Orders  │                       │   Panel   │                         │   Products│
   │ • Profile │                       │ • Orders  │                         │ • Categories│
   │ • No admin│                       │ • No      │                         │ • No      │
   │   access  │                       │   Admin   │                         │   Vendor  │
   └───────────┘                       │   Dashboard                         │   Mgmt    │
         │                             └───────────┘                         └───────────┘
         │                                    │                                    │
         │                                    │                                    │
         └────────────────────────────────────┼────────────────────────────────────┘
                                              │
                                              ▼
                                       ┌───────────┐
                                       │   Admin   │
                                       │(owner_    │
                                       │ admin)    │
                                       │           │
                                       │ • All of  │
                                       │   Manager │
                                       │ • Vendor  │
                                       │   Management│
                                       │ • Approve/│
                                       │   Suspend │
                                       │   vendors│
                                       └───────────┘
```

---

If you want more detail on a specific part (e.g. “exact steps to approve a vendor” or “how product creation works for a vendor”), say which area and we can break it down step by step.
