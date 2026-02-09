# BuildMart AI – Feature audit vs India-ready spec

This document checks the application against the recommended India-ready construction e‑commerce spec.

---

## 1️⃣ Deep product categories (India-ready structure)

| Spec | Status | Notes |
|------|--------|------|
| Primary categories (Cement, Steel, Aggregates, Bricks, etc.) | ⚠️ Schema ready | Categories support hierarchy (`parentId`). No predefined India tree yet – admins create categories. |
| Sub-categorization (Brand, Grade, OPC/PPC/PSC) | ⚠️ Schema ready | Products have `brand`, `specs` (JSON e.g. grade, size). UI filters for **Brand** and **Grade** added. |
| By project stage / usage / budget | ❌ Not yet | Could be category names or product tags – not implemented. |

**Recommendation:** Add seed categories (Cement → OPC/PPC/PSC, Steel → TMT/Structural, etc.) or an admin guide. Current schema supports deep trees.

---

## 2️⃣ Multiple purchase modes (India-specific)

| Mode | Status | Notes |
|------|--------|------|
| **Option 1: Direct buy** | ✅ Yes | Cart → “Proceed to Checkout” → order created in Firestore. |
| **Option 2: Request quote** | ✅ Yes | “Get Quote” on product/card; quote dialog (project type, location, requirements); saved in Firestore. |
| **Option 3: Advance booking** | ✅ Yes | “Book Now”; booking with date, time, location, advance; saved in Firestore. |
| **Option 4: Assisted (AI/vendor)** | ⚠️ Partial | AI Assistant and AI tools exist; no direct “create order from chat” flow yet. |

---

## 3️⃣ Select from specific shop / vendor

| Spec | Status | Notes |
|------|--------|------|
| Filter by shop (vendor) | ✅ Yes | “Shop” dropdown on home and category page; filters products by `vendorId`. |
| Vendor visibility | ✅ Yes | Vendor list from Firestore (role = vendor); each product has one vendor. |

---

## 4️⃣ Select from specific area / locality (should be default)

| Spec | Status | Notes |
|------|--------|------|
| User enters city / area / pincode | ✅ Added | “Set your location” (city + pincode); stored in localStorage; used as default for filters. |
| Show nearby vendors | ⚠️ By city | Vendors filtered by **city** (and pincode when vendor has it). No lat/long or distance yet. |
| Filter “Only X area” | ✅ Yes | Area dropdown = vendor cities; “My location” pre-fills area when it matches. |
| “Within 5 km” / “Same-day delivery” | ❌ Not yet | Would need coordinates or delivery slots per vendor. |
| Local pricing / vendor rating | ⚠️ Partial | Pricing per product (vendor-specific). Vendor **rating** not in schema/UI yet. |

---

## 5️⃣ Combined flow (e.g. “Building in Miyapur”)

| Step | Status |
|------|--------|
| Select location (e.g. Miyapur) | ✅ City + pincode; used to narrow vendors. |
| Choose category (e.g. Cement) | ✅ Shop by category + category page. |
| Filter by brand / grade | ✅ Brand and Grade filters in category sidebar. |
| Select vendor (e.g. Sri Lakshmi Cement) | ✅ Shop dropdown. |
| Quantity + price + delivery | ✅ Quantity on product; price; booking/quote for delivery. |
| Advance payment / track | ⚠️ Advance in booking; no payment gateway or tracking UI yet. |

---

## 6️⃣ Data model

| Spec | Status |
|------|--------|
| Product ≠ Vendor | ✅ Product has `vendorId`; same logical product can be different docs per vendor (different price, delivery). |
| Customer chooses who to buy from | ✅ Shop filter + product list per vendor. |

---

## 7️⃣ Summary table

| Feature | Spec | Current |
|---------|------|--------|
| Category depth | Deep & smart | Hierarchy + brand/grade filters; no seed India tree |
| Direct purchase | Yes | ✅ |
| Request quote (RFQ) | AI-powered | ✅ Quote flow (AI can be wired to suggest) |
| Vendor choice | Yes | ✅ |
| Area selection | Strong, default | ✅ City + pincode; area filter |
| Local shop visibility | Yes | ✅ Shop + area filters |
| Location-first UX | User sets location first | ✅ “Set your location” (city + pincode) |
| Brand / Grade filters | Yes | ✅ In category page |
| Distance / “within X km” | Optional | ❌ No coordinates |
| Vendor rating | Optional | ❌ Not in schema yet |

---

## Implemented in this pass

- **Location-first:** “Set your location” (city + pincode) at top; persisted; used to pre-select area and filter vendors.
- **Brand filter:** Dropdown in category sidebar from product `brand`.
- **Grade filter:** Dropdown in category sidebar from product `specs.grade` (or similar).
- **FEATURE_AUDIT.md:** This document.

## Suggested next steps (implemented)

1. **Vendor rating** – Done: `users.rating`/`ratingCount`; `vendor_ratings` collection; "Rate a shop" dialog; shop list shows stars.
2. **Seed categories**: India tree in `seed-india-categories.ts`; Admin Categories page → "Seed India categories" button.
3. **Same-day delivery**: `users.sameDayDelivery`; vendors set in Profile; customer filters: Same-day checkbox and "Within X km".
4. **Coordinates**: `users.latitude`/`longitude` for vendors; delivery location has optional lat/lon + "Use my location"; distance and "Within X km" filter.
