import { storage } from "./storage";

export const seedDummyData = async () => {
  try {
    console.log("Starting to seed dummy data...");

    // Check if data already exists
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) {
      console.log("Data already seeded, skipping...");
      return;
    }

    // Seed Categories
    const categoriesData = [
      // Main Categories
      { name: "Cement & Concrete", description: "High-quality cement and concrete products", parentId: null, displayOrder: 1, isActive: true },
      { name: "Steel & Iron", description: "Construction grade steel and iron materials", parentId: null, displayOrder: 2, isActive: true },
      { name: "Bricks & Blocks", description: "Various types of bricks and building blocks", parentId: null, displayOrder: 3, isActive: true },
      { name: "Plumbing Materials", description: "Pipes, fittings, and plumbing accessories", parentId: null, displayOrder: 4, isActive: true },
      { name: "Electrical Supplies", description: "Wires, cables, and electrical components", parentId: null, displayOrder: 5, isActive: true },
      { name: "Roofing Materials", description: "Tiles, sheets, and roofing accessories", parentId: null, displayOrder: 6, isActive: true },
      { name: "Paints & Coatings", description: "Interior and exterior paints", parentId: null, displayOrder: 7, isActive: true },
      { name: "Tools & Hardware", description: "Construction tools and hardware", parentId: null, displayOrder: 8, isActive: true },
      { name: "Flooring", description: "Tiles, marble, and flooring materials", parentId: null, displayOrder: 9, isActive: true },
      { name: "Doors & Windows", description: "Doors, windows, and frames", parentId: null, displayOrder: 10, isActive: true },
    ];

    const createdCategories = [];
    for (const categoryData of categoriesData) {
      const category = await storage.createCategory(categoryData);
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // Create sub-categories
    const subCategoriesData = [
      { name: "OPC Cement", description: "Ordinary Portland Cement", parentId: createdCategories[0].id, displayOrder: 1, isActive: true },
      { name: "PPC Cement", description: "Portland Pozzolana Cement", parentId: createdCategories[0].id, displayOrder: 2, isActive: true },
      { name: "Ready Mix Concrete", description: "Pre-mixed concrete", parentId: createdCategories[0].id, displayOrder: 3, isActive: true },
      { name: "TMT Bars", description: "Thermo-mechanically treated bars", parentId: createdCategories[1].id, displayOrder: 1, isActive: true },
      { name: "Mild Steel", description: "Mild steel products", parentId: createdCategories[1].id, displayOrder: 2, isActive: true },
      { name: "Red Bricks", description: "Traditional clay bricks", parentId: createdCategories[2].id, displayOrder: 1, isActive: true },
      { name: "Fly Ash Bricks", description: "Eco-friendly bricks", parentId: createdCategories[2].id, displayOrder: 2, isActive: true },
      { name: "PVC Pipes", description: "Polyvinyl chloride pipes", parentId: createdCategories[3].id, displayOrder: 1, isActive: true },
      { name: "CPVC Pipes", description: "Chlorinated polyvinyl chloride pipes", parentId: createdCategories[3].id, displayOrder: 2, isActive: true },
    ];

    const createdSubCategories = [];
    for (const subCategoryData of subCategoriesData) {
      const subCategory = await storage.createCategory(subCategoryData);
      createdSubCategories.push(subCategory);
      console.log(`Created sub-category: ${subCategory.name}`);
    }

    // Create vendor user for products
    const vendorUser = await storage.createUser({
      username: "buildmart_vendor",
      email: "vendor@buildmart.com",
      password: "$2a$10$8K1p/a5dqx5l7.8o4KFW0u1YvF7XZTb5Kv1Y.4J3Qp1Yt.d1Y9K2m", // password: admin123
      role: "vendor"
    });

    // Seed Products
    const productsData = [
      // Cement Products
      {
        name: "UltraTech Super Cement OPC 53",
        description: "Premium quality Ordinary Portland Cement with superior strength and durability. Ideal for high-rise construction and infrastructure projects.",
        categoryId: createdSubCategories[0].id,
        vendorId: vendorUser.id,
        basePrice: "425.00",
        stockQuantity: 500,
        specifications: { grade: "53", type: "OPC", brand: "UltraTech", weight: "50kg", compressive_strength: "53 MPa" },
        quantitySlabs: { "1-10": 425, "11-50": 420, "51-100": 415, "100+": 410 },
        dynamicCharges: { loading: 15, delivery: 25, tax: 8.5 },
        isActive: true
      },
      {
        name: "ACC Gold Water Resistant Cement",
        description: "Advanced water-resistant cement with enhanced protection against moisture. Perfect for coastal and high-humidity areas.",
        categoryId: createdSubCategories[1].id,
        vendorId: vendorUser.id,
        basePrice: "445.00",
        stockQuantity: 300,
        specifications: { grade: "43", type: "PPC", brand: "ACC", weight: "50kg", water_resistance: "High" },
        quantitySlabs: { "1-10": 445, "11-50": 440, "51-100": 435, "100+": 430 },
        dynamicCharges: { loading: 15, delivery: 25, tax: 8.5 },
        isActive: true
      },
      {
        name: "Ambuja Plus Roof Special Cement",
        description: "Specialized cement designed for roof construction with superior heat resistance and strength.",
        categoryId: createdSubCategories[0].id,
        vendorId: vendorUser.id,
        basePrice: "465.00",
        stockQuantity: 200,
        specifications: { grade: "53", type: "OPC", brand: "Ambuja", weight: "50kg", heat_resistance: "High" },
        quantitySlabs: { "1-10": 465, "11-50": 460, "51-100": 455, "100+": 450 },
        dynamicCharges: { loading: 15, delivery: 25, tax: 8.5 },
        isActive: true
      },

      // Steel Products
      {
        name: "TATA Tiscon TMT Bar Fe500D",
        description: "High-strength TMT bars with superior ductility and earthquake resistance. Corrosion-resistant and long-lasting.",
        categoryId: createdSubCategories[3].id,
        vendorId: vendorUser.id,
        basePrice: "65.00",
        stockQuantity: 1000,
        specifications: { grade: "Fe500D", brand: "TATA", diameter: "12mm", length: "12m", yield_strength: "500 MPa" },
        quantitySlabs: { "1-50": 65, "51-200": 63, "201-500": 61, "500+": 59 },
        dynamicCharges: { loading: 2, delivery: 3, tax: 12 },
        isActive: true
      },
      {
        name: "JSW NeoSteel TMT Bar Fe500",
        description: "Premium quality TMT bars with advanced metallurgy. Excellent bendability and weldability for all construction needs.",
        categoryId: createdSubCategories[3].id,
        vendorId: vendorUser.id,
        basePrice: "63.00",
        stockQuantity: 800,
        specifications: { grade: "Fe500", brand: "JSW", diameter: "16mm", length: "12m", yield_strength: "500 MPa" },
        quantitySlabs: { "1-50": 63, "51-200": 61, "201-500": 59, "500+": 57 },
        dynamicCharges: { loading: 2, delivery: 3, tax: 12 },
        isActive: true
      },

      // Brick Products
      {
        name: "Premium Red Clay Bricks",
        description: "High-quality burnt clay bricks with excellent compressive strength. Perfect for load-bearing walls and construction.",
        categoryId: createdSubCategories[5].id,
        vendorId: vendorUser.id,
        basePrice: "6.50",
        stockQuantity: 10000,
        specifications: { type: "First Class", material: "Clay", size: "230x110x75mm", compressive_strength: "7.5 MPa" },
        quantitySlabs: { "1-1000": 6.5, "1001-5000": 6.2, "5001-10000": 5.9, "10000+": 5.5 },
        dynamicCharges: { loading: 0.5, delivery: 1, tax: 5 },
        isActive: true
      },
      {
        name: "Eco-Friendly Fly Ash Bricks",
        description: "Environment-friendly bricks made from fly ash. Lightweight, strong, and energy-efficient for modern construction.",
        categoryId: createdSubCategories[6].id,
        vendorId: vendorUser.id,
        basePrice: "7.25",
        stockQuantity: 8000,
        specifications: { type: "Class F", material: "Fly Ash", size: "230x110x75mm", compressive_strength: "9 MPa" },
        quantitySlabs: { "1-1000": 7.25, "1001-5000": 7.0, "5001-10000": 6.75, "10000+": 6.5 },
        dynamicCharges: { loading: 0.5, delivery: 1, tax: 5 },
        isActive: true
      },

      // Plumbing Products
      {
        name: "Supreme PVC Pipe 4 inch",
        description: "High-quality PVC pipes for drainage and sewage systems. Chemical resistant and long-lasting.",
        categoryId: createdSubCategories[7].id,
        vendorId: vendorUser.id,
        basePrice: "185.00",
        stockQuantity: 400,
        specifications: { brand: "Supreme", diameter: "4 inch", length: "6m", pressure: "4 kg/cm²", material: "PVC" },
        quantitySlabs: { "1-10": 185, "11-50": 180, "51-100": 175, "100+": 170 },
        dynamicCharges: { loading: 5, delivery: 10, tax: 12 },
        isActive: true
      },
      {
        name: "Astral CPVC Pipe 1 inch",
        description: "Premium CPVC pipes for hot and cold water supply. Corrosion-resistant and safe for drinking water.",
        categoryId: createdSubCategories[8].id,
        vendorId: vendorUser.id,
        basePrice: "125.00",
        stockQuantity: 350,
        specifications: { brand: "Astral", diameter: "1 inch", length: "3m", pressure: "25 kg/cm²", material: "CPVC" },
        quantitySlabs: { "1-10": 125, "11-50": 120, "51-100": 115, "100+": 110 },
        dynamicCharges: { loading: 3, delivery: 8, tax: 12 },
        isActive: true
      },

      // Electrical Products
      {
        name: "Polycab Copper Wire 2.5mm",
        description: "High-grade electrolytic copper wire for house wiring. Fire-resistant and durable with superior conductivity.",
        categoryId: createdCategories[4].id,
        vendorId: vendorUser.id,
        basePrice: "8.50",
        stockQuantity: 2000,
        specifications: { brand: "Polycab", size: "2.5 sq mm", material: "Copper", insulation: "PVC", voltage: "1100V" },
        quantitySlabs: { "1-100": 8.5, "101-500": 8.2, "501-1000": 7.9, "1000+": 7.5 },
        dynamicCharges: { loading: 0.1, delivery: 0.2, tax: 12 },
        isActive: true
      },

      // Roofing Materials
      {
        name: "Jindal Colour Roofing Sheets",
        description: "Pre-painted galvanized steel roofing sheets. Weather-resistant and available in multiple colors.",
        categoryId: createdCategories[5].id,
        vendorId: vendorUser.id,
        basePrice: "285.00",
        stockQuantity: 250,
        specifications: { brand: "Jindal", thickness: "0.5mm", width: "1050mm", length: "12ft", coating: "Galvanized" },
        quantitySlabs: { "1-20": 285, "21-50": 280, "51-100": 275, "100+": 270 },
        dynamicCharges: { loading: 10, delivery: 15, tax: 12 },
        isActive: true
      },

      // Paint Products
      {
        name: "Asian Paints Royale Atmos",
        description: "Premium interior emulsion paint with advanced air purifying technology. Long-lasting and beautiful finish.",
        categoryId: createdCategories[6].id,
        vendorId: vendorUser.id,
        basePrice: "3250.00",
        stockQuantity: 100,
        specifications: { brand: "Asian Paints", type: "Emulsion", coverage: "140-160 sqft/liter", finish: "Matt", volume: "20L" },
        quantitySlabs: { "1-5": 3250, "6-20": 3200, "21-50": 3150, "50+": 3100 },
        dynamicCharges: { loading: 25, delivery: 40, tax: 12 },
        isActive: true
      },

      // Tools & Hardware
      {
        name: "Bosch GSB 500W Impact Drill",
        description: "Professional impact drill for heavy-duty construction work. Variable speed with hammer action.",
        categoryId: createdCategories[7].id,
        vendorId: vendorUser.id,
        basePrice: "2850.00",
        stockQuantity: 50,
        specifications: { brand: "Bosch", power: "500W", chuck: "13mm", speed: "0-3000 rpm", features: "Impact Action" },
        quantitySlabs: { "1-5": 2850, "6-10": 2800, "11-20": 2750, "20+": 2700 },
        dynamicCharges: { loading: 50, delivery: 75, tax: 18 },
        isActive: true
      },

      // Flooring Products
      {
        name: "Kajaria Vitrified Floor Tiles",
        description: "Premium vitrified tiles with superior finish. Water-resistant and easy to maintain.",
        categoryId: createdCategories[8].id,
        vendorId: vendorUser.id,
        basePrice: "45.00",
        stockQuantity: 2000,
        specifications: { brand: "Kajaria", size: "600x600mm", thickness: "8mm", finish: "Glossy", type: "Vitrified" },
        quantitySlabs: { "1-100": 45, "101-500": 42, "501-1000": 40, "1000+": 38 },
        dynamicCharges: { loading: 2, delivery: 5, tax: 12 },
        isActive: true
      }
    ];

    for (const productData of productsData) {
      const product = await storage.createProduct(productData);
      console.log(`Created product: ${product.name}`);
    }

    console.log("Dummy data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding dummy data:", error);
  }
};

// Call this function to seed data
export const initializeDummyData = async () => {
  await seedDummyData();
};