// CSV Templates for dynamic uploads

export const csvTemplates = {
  products: {
    headers: ['name', 'description', 'categoryId', 'basePrice', 'stockQuantity', 'brand', 'company', 'gstRate'],
    sample: `name,description,categoryId,basePrice,stockQuantity,brand,company,gstRate
Premium Portland Cement,High quality cement for construction,cement-cat-id,450,100,UltraTech,UltraTech Cement Ltd,18
Steel TMT Bars 12mm,High strength TMT bars,steel-cat-id,55000,200,TATA,TATA Steel,18
PVC Pipes 4 inch,Durable PVC pipes for plumbing,plumbing-cat-id,120,150,Prince,Prince Pipes,18`
  },
  categories: {
    headers: ['name', 'description', 'parentId'],
    sample: `name,description,parentId
Cement,All types of cement products,
Steel,Steel and iron products,
Plumbing,Plumbing materials and fittings,
Electrical,Electrical components and wiring,
Paints,Paint and coating materials,`
  },
  contractors: {
    headers: ['name', 'email', 'phone', 'address', 'specialization', 'experience'],
    sample: `name,email,phone,address,specialization,experience
ABC Construction,abc@construction.com,9876543210,123 Builder Street Mumbai,Residential Construction,15
XYZ Infra,xyz@infra.com,9876543211,456 Project Road Delhi,Commercial Construction,20
Prime Builders,prime@builders.com,9876543212,789 Structure Ave Bangalore,Infrastructure,12`
  },
  marketingMaterials: {
    headers: ['title', 'description', 'type', 'url', 'targetAudience'],
    sample: `title,description,type,url,targetAudience
Construction Guide 2024,Complete guide for construction planning,brochure,https://example.com/guide.pdf,Contractors
Product Catalog,Latest product catalog with prices,catalog,https://example.com/catalog.pdf,All Users
Safety Guidelines,Construction safety best practices,manual,https://example.com/safety.pdf,Workers`
  },
  orders: {
    headers: ['customerName', 'customerEmail', 'productId', 'quantity', 'totalAmount', 'status'],
    sample: `customerName,customerEmail,productId,quantity,totalAmount,status
John Contractor,john@contractor.com,prod-cement-001,50,22500,pending
Mary Builder,mary@builder.com,prod-steel-002,20,110000,processing
ABC Construction,abc@construction.com,prod-pipes-003,100,12000,completed`
  },
  advances: {
    headers: ['customerName', 'customerEmail', 'orderId', 'advanceAmount', 'advanceDate', 'status'],
    sample: `customerName,customerEmail,orderId,advanceAmount,advanceDate,status
John Contractor,john@contractor.com,order-001,10000,2024-01-15,paid
Mary Builder,mary@builder.com,order-002,50000,2024-01-16,pending
ABC Construction,abc@construction.com,order-003,5000,2024-01-17,paid`
  }
};

export function generateCSVTemplate(type: string): string {
  const template = csvTemplates[type as keyof typeof csvTemplates];
  if (!template) {
    throw new Error(`Template not found for type: ${type}`);
  }
  return template.sample;
}

export function getCSVHeaders(type: string): string[] {
  const template = csvTemplates[type as keyof typeof csvTemplates];
  if (!template) {
    throw new Error(`Template not found for type: ${type}`);
  }
  return template.headers;
}