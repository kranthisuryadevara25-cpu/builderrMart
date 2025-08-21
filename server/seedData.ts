import { storage } from "./storage";
import bcrypt from 'bcryptjs';
import type { InsertCategory, InsertProduct, InsertUser } from "@shared/schema";

export async function initializeDummyData() {
  try {
    console.log("Starting to seed dummy data...");
    
    // Clear existing data to ensure fresh seed
    console.log("Clearing existing data...");

    // Create users
    const users = [
      {
        username: "admin",
        email: "admin@buildmart.ai", 
        password: await bcrypt.hash('admin123', 12),
        role: "owner_admin"
      },
      {
        username: "manager",
        email: "manager@buildmart.ai",
        password: await bcrypt.hash('manager123', 12),
        role: "vendor_manager"
      },
      {
        username: "vendor1",
        email: "vendor1@buildmart.ai",
        password: await bcrypt.hash('vendor123', 12),
        role: "vendor"
      },
      {
        username: "vendor2",
        email: "vendor2@buildmart.ai",
        password: await bcrypt.hash('vendor123', 12),
        role: "vendor"
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      try {
        const user = await storage.createUser(userData);
        createdUsers.push(user);
      } catch (error: any) {
        // If user already exists, fetch existing user
        if (error.code === '23505') {
          console.log(`User ${userData.username} already exists, fetching existing user...`);
          const existingUser = await storage.getUserByUsername(userData.username);
          if (existingUser) {
            createdUsers.push(existingUser);
          }
        } else {
          throw error;
        }
      }
    }

    // Create comprehensive categories
    const categories = [
      {
        name: "Cement & Concrete",
        description: "Portland cement, ready mix concrete, cement blocks"
      },
      {
        name: "Steel & Iron",
        description: "TMT bars, mild steel, stainless steel, iron rods"
      },
      {
        name: "Bricks & Blocks",
        description: "Red bricks, fly ash bricks, AAC blocks, concrete blocks"
      },
      {
        name: "Sand & Aggregates",
        description: "River sand, M-sand, stone chips, crushed aggregates"
      },
      {
        name: "Plumbing Materials",
        description: "PVC pipes, fittings, valves, bathroom fixtures"
      },
      {
        name: "Electrical Supplies",
        description: "Wires, cables, switches, electrical panels"
      },
      {
        name: "Tiles & Flooring",
        description: "Ceramic tiles, marble, granite, wooden flooring"
      },
      {
        name: "Paints & Coatings",
        description: "Interior paints, exterior paints, primers, waterproofing"
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await storage.createCategory(categoryData);
      createdCategories.push(category);
    }

    // Create comprehensive products for each category
    const products = [
      // Cement & Concrete
      {
        name: "UltraTech Portland Cement OPC 53 Grade",
        description: "High-quality Ordinary Portland Cement, 53 grade with superior strength and durability. Perfect for all construction needs.",
        categoryId: createdCategories[0].id,
        basePrice: "425",
        specs: {
          grade: "53",
          type: "OPC",
          compressiveStrength: "53 MPa",
          packSize: "50 kg",
          brand: "UltraTech"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 20, price_per_unit: 425 },
          { min_qty: 21, max_qty: 100, price_per_unit: 415 },
          { min_qty: 101, max_qty: 1000, price_per_unit: 405 }
        ],
        dynamicCharges: {
          loading: { rate: 2, unit: "bag", description: "Loading charges" },
          transportation: { rate: 0.5, unit: "km", description: "Per km transport cost" }
        },
        vendorId: createdUsers[0].id,
        stockQuantity: 5000,
        isFeatured: true,
        isTrending: true
      },
      {
        name: "ACC Gold Water Resistant Cement",
        description: "Premium water-resistant cement with advanced formula for enhanced durability in all weather conditions.",
        categoryId: createdCategories[0].id,
        basePrice: "445",
        specs: {
          grade: "53",
          type: "PPC",
          specialFeature: "Water Resistant",
          packSize: "50 kg",
          brand: "ACC"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 20, price_per_unit: 445 },
          { min_qty: 21, max_qty: 100, price_per_unit: 435 },
          { min_qty: 101, max_qty: 1000, price_per_unit: 425 }
        ],
        dynamicCharges: null,
        vendorId: createdUsers[0].id,
        stockQuantity: 3500,
        isFeatured: true
      },
      {
        name: "Ready Mix Concrete M25 Grade",
        description: "High-quality ready mix concrete M25 grade, perfect for residential and commercial construction.",
        categoryId: createdCategories[0].id,
        basePrice: "3500",
        specs: {
          grade: "M25",
          compressiveStrength: "25 MPa",
          slump: "75-100 mm",
          unit: "per cubic meter"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 3500 },
          { min_qty: 11, max_qty: 50, price_per_unit: 3400 },
          { min_qty: 51, max_qty: 200, price_per_unit: 3300 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 1000,
        isTrending: true
      },

      // Steel & Iron  
      {
        name: "TATA Steel TMT Bars Fe500D - 12mm",
        description: "High-strength TMT bars with superior bendability and weldability. Earthquake resistant and corrosion resistant.",
        categoryId: createdCategories[1].id,
        basePrice: "65",
        specs: {
          grade: "Fe500D",
          diameter: "12mm",
          length: "12 meters",
          standard: "IS 1786:2008",
          brand: "TATA Steel"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 50, price_per_unit: 65 },
          { min_qty: 51, max_qty: 200, price_per_unit: 63 },
          { min_qty: 201, max_qty: 1000, price_per_unit: 61 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 8000,
        isFeatured: true,
        isTrending: true
      },
      {
        name: "JSW Neo Steel TMT Bars Fe415 - 16mm", 
        description: "Premium quality TMT bars with excellent ductility and strength. Ideal for all construction applications.",
        categoryId: createdCategories[1].id,
        basePrice: "58",
        specs: {
          grade: "Fe415",
          diameter: "16mm", 
          length: "12 meters",
          standard: "IS 1786:2008",
          brand: "JSW"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 50, price_per_unit: 58 },
          { min_qty: 51, max_qty: 200, price_per_unit: 56 },
          { min_qty: 201, max_qty: 1000, price_per_unit: 54 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 6500,
        isTrending: true
      },
      {
        name: "MS Angle Iron 40x40x5mm",
        description: "Mild steel angle iron for structural applications. Hot rolled with smooth finish.",
        categoryId: createdCategories[1].id,
        basePrice: "45",
        specs: {
          material: "Mild Steel",
          size: "40x40x5mm",
          length: "6 meters",
          finish: "Hot Rolled",
          weight: "2.98 kg/m"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 20, price_per_unit: 45 },
          { min_qty: 21, max_qty: 100, price_per_unit: 43 },
          { min_qty: 101, max_qty: 500, price_per_unit: 41 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 2000
      },

      // Bricks & Blocks
      {
        name: "Red Clay Bricks - First Class",
        description: "High-quality red clay bricks with excellent compressive strength and thermal insulation properties.",
        categoryId: createdCategories[2].id,
        basePrice: "6.50",
        specs: {
          class: "First Class",
          size: "230x115x75mm",
          compressiveStrength: "35 kg/cm²",
          waterAbsorption: "15-20%",
          weight: "3.5 kg"
        },
        quantitySlabs: [
          { min_qty: 100, max_qty: 1000, price_per_unit: 6.50 },
          { min_qty: 1001, max_qty: 5000, price_per_unit: 6.25 },
          { min_qty: 5001, max_qty: 25000, price_per_unit: 6.00 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 50000,
        isFeatured: true
      },
      {
        name: "AAC Blocks 600x200x100mm",
        description: "Autoclaved Aerated Concrete blocks - lightweight, insulated, and eco-friendly building material.",
        categoryId: createdCategories[2].id,
        basePrice: "85",
        specs: {
          size: "600x200x100mm",
          density: "550-650 kg/m³",
          compressiveStrength: "3.5-4.5 N/mm²",
          thermalConductivity: "0.16 W/mK",
          weight: "7-8 kg"
        },
        quantitySlabs: [
          { min_qty: 10, max_qty: 100, price_per_unit: 85 },
          { min_qty: 101, max_qty: 500, price_per_unit: 82 },
          { min_qty: 501, max_qty: 2000, price_per_unit: 79 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 15000,
        isTrending: true
      },

      // Sand & Aggregates
      {
        name: "M-Sand (Manufactured Sand) - Fine Grade",
        description: "High-quality manufactured sand, washed and graded. Perfect replacement for river sand.",
        categoryId: createdCategories[3].id,
        basePrice: "1850",
        specs: {
          type: "Manufactured Sand",
          grade: "Fine",
          zoneGradation: "Zone II",
          fineness: "2.6-3.2",
          unit: "per cubic meter"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 1850 },
          { min_qty: 11, max_qty: 50, price_per_unit: 1800 },
          { min_qty: 51, max_qty: 200, price_per_unit: 1750 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 500,
        isFeatured: true
      },
      {
        name: "Blue Metal Stone Chips - 20mm",
        description: "High-quality blue metal stone chips for concrete mixing and road construction.",
        categoryId: createdCategories[3].id,
        basePrice: "2200",
        specs: {
          size: "20mm",
          material: "Blue Metal",
          crushingValue: "18-22%",
          specificGravity: "2.6-2.8",
          unit: "per cubic meter"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 2200 },
          { min_qty: 11, max_qty: 50, price_per_unit: 2150 },
          { min_qty: 51, max_qty: 200, price_per_unit: 2100 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 800
      },

      // Plumbing Materials
      {
        name: "Supreme PVC Pipe 110mm - 6m Length",
        description: "High-quality PVC drainage pipe with excellent chemical resistance and durability.",
        categoryId: createdCategories[4].id,
        basePrice: "485",
        specs: {
          diameter: "110mm",
          length: "6 meters",
          standard: "IS 13592",
          pressure: "SWR Grade",
          brand: "Supreme"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 20, price_per_unit: 485 },
          { min_qty: 21, max_qty: 100, price_per_unit: 475 },
          { min_qty: 101, max_qty: 500, price_per_unit: 465 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 1200
      },
      {
        name: "Hindware Bathroom Sink with Faucet",
        description: "Premium ceramic bathroom sink with chrome-plated faucet. Modern design with excellent finish.",
        categoryId: createdCategories[4].id,
        basePrice: "3850",
        specs: {
          material: "Ceramic",
          size: "550x400mm",
          mounting: "Wall Mount",
          faucetFinish: "Chrome Plated",
          brand: "Hindware"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 3850 },
          { min_qty: 11, max_qty: 50, price_per_unit: 3750 },
          { min_qty: 51, max_qty: 100, price_per_unit: 3650 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 150
      },

      // Electrical Supplies
      {
        name: "Havells PVC Insulated Copper Wire - 2.5mm²",
        description: "High-quality PVC insulated copper wire for residential and commercial electrical installations.",
        categoryId: createdCategories[5].id,
        basePrice: "125",
        specs: {
          core: "Copper",
          insulation: "PVC",
          crossSection: "2.5mm²",
          voltage: "1100V",
          length: "90 meters",
          brand: "Havells"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 125 },
          { min_qty: 11, max_qty: 50, price_per_unit: 122 },
          { min_qty: 51, max_qty: 200, price_per_unit: 119 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 2500
      },
      {
        name: "Schneider Modular Switch 6A - White",
        description: "Premium modular switch with elegant design and reliable performance. ISI marked.",
        categoryId: createdCategories[5].id,
        basePrice: "185",
        specs: {
          current: "6A",
          voltage: "240V",
          color: "White",
          standard: "IS 3854",
          warranty: "2 years",
          brand: "Schneider"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 20, price_per_unit: 185 },
          { min_qty: 21, max_qty: 100, price_per_unit: 180 },
          { min_qty: 101, max_qty: 500, price_per_unit: 175 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 800
      },

      // Tiles & Flooring  
      {
        name: "Kajaria Vitrified Floor Tiles 800x800mm",
        description: "Premium vitrified floor tiles with nano polish technology. Water resistant and stain proof.",
        categoryId: createdCategories[6].id,
        basePrice: "125",
        specs: {
          size: "800x800mm",
          finish: "Nano Polish",
          thickness: "10mm",
          waterAbsorption: "<0.5%",
          application: "Floor & Wall",
          brand: "Kajaria"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 50, price_per_unit: 125 },
          { min_qty: 51, max_qty: 200, price_per_unit: 122 },
          { min_qty: 201, max_qty: 1000, price_per_unit: 119 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 3000
      },
      {
        name: "Italian Marble Carrara White - 18mm",
        description: "Premium Italian Carrara white marble with beautiful veining. Perfect for luxury interiors.",
        categoryId: createdCategories[6].id,
        basePrice: "285",
        specs: {
          origin: "Italy",
          thickness: "18mm",
          finish: "Polished",
          pattern: "Carrara White",
          application: "Floor & Wall",
          unit: "per sq ft"
        },
        quantitySlabs: [
          { min_qty: 100, max_qty: 500, price_per_unit: 285 },
          { min_qty: 501, max_qty: 1500, price_per_unit: 275 },
          { min_qty: 1501, max_qty: 5000, price_per_unit: 265 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 2000
      },

      // Paints & Coatings
      {
        name: "Asian Paints Royale Luxury Emulsion - 20L",
        description: "Premium luxury emulsion with rich finish and excellent coverage. Available in multiple shades.",
        categoryId: createdCategories[7].id,
        basePrice: "4850",
        specs: {
          type: "Acrylic Emulsion",
          finish: "Matt",
          coverage: "140-160 sq ft/L",
          dryingTime: "2-3 hours",
          packSize: "20 liters",
          brand: "Asian Paints"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 4850 },
          { min_qty: 11, max_qty: 50, price_per_unit: 4750 },
          { min_qty: 51, max_qty: 200, price_per_unit: 4650 }
        ],
        vendorId: createdUsers[0].id,
        stockQuantity: 500
      },
      {
        name: "Berger Weathercoat Exterior Paint - 10L",
        description: "High-performance exterior paint with 12-year performance warranty. Weather resistant formula.",
        categoryId: createdCategories[7].id,
        basePrice: "3250",
        specs: {
          type: "Acrylic Exterior",
          finish: "Matt",
          coverage: "120-140 sq ft/L", 
          warranty: "12 years",
          packSize: "10 liters",
          brand: "Berger"
        },
        quantitySlabs: [
          { min_qty: 1, max_qty: 10, price_per_unit: 3250 },
          { min_qty: 11, max_qty: 50, price_per_unit: 3150 },
          { min_qty: 51, max_qty: 200, price_per_unit: 3050 }
        ],
        vendorId: createdUsers[1].id,
        stockQuantity: 750
      }
    ];

    const createdProducts = [];
    for (const productData of products) {
      const product = await storage.createProduct(productData);
      createdProducts.push(product);
    }

    // Add more featured/trending flags to remaining products
    for (let i = 10; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      if (i % 3 === 0) {
        await storage.updateProduct(product.id, { isFeatured: true });
      }
      if (i % 4 === 0) {
        await storage.updateProduct(product.id, { isTrending: true });
      }
    }

    // Create discounts
    const adminUser = createdUsers.find(u => u.role === 'owner_admin');
    const discounts = [
      {
        code: 'BULK20',
        name: '20% Bulk Order Discount',
        description: 'Get 20% off on orders above ₹50,000',
        discountType: 'percentage',
        discountValue: '20',
        minOrderAmount: '50000',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 100,
        createdBy: adminUser?.id
      },
      {
        code: 'NEWCUSTOMER',
        name: 'New Customer Offer',
        description: 'Flat ₹1000 off for new customers',
        discountType: 'fixed_amount',
        discountValue: '1000',
        minOrderAmount: '10000',
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 500,
        createdBy: adminUser?.id
      },
      {
        code: 'CEMENT15',
        name: 'Cement Special',
        description: '15% off on all cement products',
        discountType: 'percentage',
        discountValue: '15',
        minOrderAmount: '0',
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: adminUser?.id
      }
    ];

    for (const discountData of discounts) {
      try {
        await storage.createDiscount(discountData);
      } catch (error) {
        console.error(`Error creating discount ${discountData.name}:`, error);
      }
    }

    // Create quotes
    const quotes = [
      {
        customerName: 'Rajesh Kumar',
        customerEmail: 'rajesh.kumar@example.com',
        customerPhone: '+91 9876543210',
        projectType: 'residential',
        projectLocation: 'Gurgaon, Haryana',
        requirements: {
          area: '2500 sq ft',
          floors: 2,
          constructionType: 'RCC',
          timeline: '12 months'
        },
        items: [
          { productId: createdProducts[0]?.id, productName: 'UltraTech Cement', quantity: 200, unitPrice: 425, totalPrice: 85000 },
          { productId: createdProducts[3]?.id, productName: 'TMT Bars', quantity: 500, unitPrice: 65, totalPrice: 32500 }
        ],
        subtotal: '117500',
        taxAmount: '21150',
        totalAmount: '138650',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Quote includes basic materials. Labor costs not included.',
        createdBy: adminUser?.id
      },
      {
        customerName: 'Priya Sharma',
        customerEmail: 'priya.sharma@example.com',
        customerPhone: '+91 9123456789',
        projectType: 'commercial',
        projectLocation: 'Noida, UP',
        requirements: {
          area: '5000 sq ft',
          floors: 3,
          constructionType: 'Office Building'
        },
        items: [
          { productId: createdProducts[1]?.id, productName: 'Premium Cement', quantity: 400, unitPrice: 445, totalPrice: 178000 }
        ],
        subtotal: '178000',
        taxAmount: '32040',
        totalAmount: '210040',
        status: 'approved',
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: adminUser?.id
      }
    ];

    for (const quoteData of quotes) {
      try {
        await storage.createQuote(quoteData);
      } catch (error) {
        console.error(`Error creating quote for ${quoteData.customerName}:`, error);
      }
    }

    // Create bookings
    const vendors = createdUsers.filter(u => u.role === 'vendor');
    const bookings = [
      {
        customerName: 'Amit Verma',
        customerEmail: 'amit.verma@example.com',
        customerPhone: '+91 9988776655',
        serviceType: 'delivery',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledTime: '10:00 AM - 12:00 PM',
        location: 'Sector 15, Faridabad',
        requirements: {
          productId: createdProducts[0]?.id,
          productName: 'UltraTech Cement',
          quantity: 50,
          specialInstructions: 'Ground floor delivery required.'
        },
        estimatedDuration: 180,
        cost: '21250',
        status: 'confirmed',
        createdBy: adminUser?.id,
        assignedTo: vendors[0]?.id
      },
      {
        customerName: 'Sunita Gupta',
        customerEmail: 'sunita.gupta@example.com',
        customerPhone: '+91 8765432109',
        serviceType: 'installation',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledTime: '2:00 PM - 5:00 PM',
        location: 'DLF Phase 2, Gurgaon',
        requirements: {
          serviceType: 'Tile Installation',
          area: '1200 sq ft',
          tileType: 'Vitrified'
        },
        estimatedDuration: 480,
        cost: '15000',
        status: 'pending',
        createdBy: adminUser?.id,
        assignedTo: vendors[1]?.id
      }
    ];

    for (const bookingData of bookings) {
      try {
        await storage.createBooking(bookingData);
      } catch (error) {
        console.error(`Error creating booking for ${bookingData.customerName}:`, error);
      }
    }

    console.log(`✅ Successfully seeded ${createdUsers.length} users, ${createdCategories.length} categories, ${createdProducts.length} products, ${discounts.length} discounts, ${quotes.length} quotes, and ${bookings.length} bookings`);
    
  } catch (error) {
    console.error("❌ Error seeding dummy data:", error);
  }
}