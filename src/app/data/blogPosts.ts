export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: { name: string; role: string; avatar: string };
  date: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
}

export const blogCategories = [
  "All", "Export News", "Import/Export Guides", "Market Trends",
  "Packaging Standards", "Food Industry", "Documentation",
];

export const blogPosts: BlogPost[] = [
  {
    id: "1", slug: "india-spice-export-2025-trends",
    title: "India's Spice Export Sector Hits Record $4.5 Billion in 2024–25",
    excerpt: "India's spice exports crossed a landmark $4.5 billion in FY2024-25, driven by strong demand from the US, Europe, and Southeast Asia. Here's what it means for B2B buyers.",
    content: `India's spice export industry has achieved a historic milestone, crossing $4.5 billion in the fiscal year 2024-25. This represents a 12% year-on-year growth, driven primarily by surging demand from North America, the European Union, and ASEAN markets.\n\nKey drivers of this growth include:\n\n**1. Premium Organic Demand**: Global consumers are increasingly seeking organic and traceable spice products. Indian exporters who hold organic certification have seen 35% higher order volumes.\n\n**2. Cumin and Turmeric Leading**: Cumin seeds from Gujarat and Turmeric from Tamil Nadu and Telangana remain the top export earners. Cumin alone contributed nearly $650 million.\n\n**3. Value-Added Products**: Spice blends, oleoresins, and essential oils are growing faster than raw commodities, indicating a maturation of the market.\n\nFor B2B importers, this is an excellent time to lock in long-term supply agreements with certified Indian exporters to benefit from stable pricing and assured quality.`,
    category: "Export News",
    image: "https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Arjun Mehta", role: "Export Analyst", avatar: "A" },
    date: "2025-04-18", readTime: 5,
    tags: ["Export", "India", "Spices", "Trade"],
    featured: true,
  },
  {
    id: "2", slug: "how-to-import-spices-from-india-guide",
    title: "Complete Guide: How to Import Spices from India in 2025",
    excerpt: "A step-by-step guide for international buyers on documentation, quality checks, payment terms, and logistics when importing spices from India.",
    content: `Importing spices from India involves understanding regulatory requirements, selecting certified suppliers, negotiating payment terms, and managing logistics efficiently.\n\n**Step 1: Identify a Certified Supplier**\nAlways work with APEDA-registered and ISO 22000:2018 certified exporters. Request their quality certifications, lab reports, and references from existing buyers.\n\n**Step 2: Request Samples**\nBefore placing a bulk order, request 500g–1kg samples for lab analysis. A professional exporter will provide free samples with a Certificate of Analysis (COA).\n\n**Step 3: Agree on Incoterms**\nCommon terms for spice imports: FOB Mumbai/Mundra, CIF your destination port, or C&F. Understand what each term includes to avoid surprise costs.\n\n**Step 4: Documentation Required**\n- Commercial Invoice\n- Packing List\n- Certificate of Origin (COO)\n- Phytosanitary Certificate\n- Health Certificate\n- Bill of Lading\n\n**Step 5: Customs Clearance**\nEnsure your destination country's import regulations are met. The EU, US (FDA), and Australia have specific MRL (Maximum Residue Limit) requirements.`,
    category: "Import/Export Guides",
    image: "https://images.unsplash.com/photo-1759272548470-d0686d071036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Priya Sharma", role: "Trade Consultant", avatar: "P" },
    date: "2025-03-22", readTime: 8,
    tags: ["Import Guide", "Documentation", "Logistics"],
  },
  {
    id: "3", slug: "black-pepper-market-outlook-2025",
    title: "Global Black Pepper Market: Price Outlook and Supply Chain Update",
    excerpt: "Black pepper prices are stabilizing after 2024's volatility. Here's what global importers should expect in H2 2025.",
    content: `The global black pepper market has experienced significant price swings over the past 18 months, driven by weather disruptions in Vietnam (the world's largest producer) and India's Malabar region.\n\nCurrent market conditions as of Q2 2025:\n\n- **Vietnam**: Production recovery underway after El Niño disruptions. Prices expected to stabilize at $3,200–$3,500/MT FOB.\n- **India**: Kerala's Malabar crop shows healthy yield. Indian black pepper at 500–550 g/L bulk density commands premium pricing.\n- **Demand**: Strong from the US, Germany, and Middle East food processing industries.\n\n**Buyer Strategy**: Consider 6-month forward contracts to lock in current prices before the Q4 demand surge.`,
    category: "Market Trends",
    image: "https://images.unsplash.com/photo-1769614596747-860600b5f2f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Karan Patel", role: "Commodity Trader", avatar: "K" },
    date: "2025-03-05", readTime: 4,
    tags: ["Black Pepper", "Prices", "Supply Chain"],
  },
  {
    id: "4", slug: "food-grade-spice-packaging-standards",
    title: "International Food-Grade Packaging Standards for Spice Exports",
    excerpt: "Understanding packaging compliance for the EU, US, and Middle East markets — what every spice importer needs to know.",
    content: `Packaging compliance is one of the most critical — and often overlooked — aspects of spice importing. Each major market has its own regulations.\n\n**EU Packaging Requirements**\n- Must be food-contact approved (EU Regulation 1935/2004)\n- Label in the local language of destination country\n- Net weight in metric units\n- Batch number and expiry date mandatory\n\n**US FDA Requirements**\n- FSMA (Food Safety Modernization Act) compliance\n- Foreign Supplier Verification Program (FSVP)\n- Nutrition facts label if retail-packaged\n\n**Middle East Requirements**\n- Halal certification often required\n- Arabic labeling for GCC countries\n- ESMA (Emirates Standards) compliance for UAE\n\n**Standard Export Packaging Options**\n1. 25 kg PP woven bags with inner liner\n2. 50 kg gunny bags (jute)\n3. 10 kg multi-layer kraft paper bags\n4. Custom retail packaging for private label`,
    category: "Packaging Standards",
    image: "https://images.unsplash.com/photo-1580982331877-489fb58aeade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Anita Joshi", role: "Quality Manager", avatar: "A" },
    date: "2025-02-14", readTime: 6,
    tags: ["Packaging", "EU", "FDA", "Compliance"],
  },
  {
    id: "5", slug: "turmeric-curcumin-health-industry-demand",
    title: "Turmeric Curcumin Demand Surges in Global Health & Nutraceutical Sector",
    excerpt: "High-curcumin turmeric is no longer just a kitchen spice — it's a premium ingredient in the $250B global nutraceutical market.",
    content: `The global nutraceutical and functional food industry is driving unprecedented demand for high-curcumin turmeric extract and powder. The health benefits of curcumin — anti-inflammatory, antioxidant, and immunity-boosting — are now backed by over 3,000 peer-reviewed studies.\n\n**Key Statistics**\n- Global turmeric market projected to reach $3.8B by 2028\n- High-curcumin varieties (3–5%+) commanding 40% price premium\n- Pharmaceutical-grade demand growing at 18% CAGR\n\n**Top Demanding Regions**\n- North America: Dietary supplements and functional beverages\n- Europe: Organic food and clean-label products\n- Japan: Cosmeceutical applications\n\n**For B2B Buyers**: Source certified high-curcumin Erode or Rajapuri varieties with HPLC test reports.`,
    category: "Food Industry",
    image: "https://images.unsplash.com/photo-1608797178894-bf7c596932da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Dr. Sanjay Rao", role: "Food Scientist", avatar: "S" },
    date: "2025-01-28", readTime: 7,
    tags: ["Turmeric", "Curcumin", "Health", "Nutraceutical"],
  },
  {
    id: "6", slug: "export-documentation-checklist-india",
    title: "Complete Export Documentation Checklist for Indian Spice Shipments",
    excerpt: "Every document you need for a compliant spice export from India — from IEC to phytosanitary certificates.",
    content: `Getting export documentation right is non-negotiable in international trade. Missing a single document can delay your shipment for weeks and cost thousands in demurrage.\n\n**Pre-Shipment Documents**\n1. Import Export Code (IEC) — mandatory for all Indian exporters\n2. APEDA Registration Certificate\n3. GST Registration\n4. Commercial Invoice with HS Code\n5. Packing List\n\n**Quality & Compliance**\n6. Certificate of Analysis (COA) — from accredited lab\n7. Phytosanitary Certificate — issued by NPPO India\n8. Certificate of Origin (COO) — from Chamber of Commerce\n9. Health Certificate (for food products)\n10. Fumigation Certificate (if required by destination)\n\n**Shipping Documents**\n11. Bill of Lading (sea) or Airway Bill (air)\n12. Shipping Bill (filed with Customs)\n13. Letter of Credit (if LC payment term)\n14. Insurance Certificate\n\n**Destination-Specific**\n15. FDA Prior Notice (US shipments)\n16. EUR.1 Certificate (EU preferential tariff)\n17. Halal Certificate (Middle East)`,
    category: "Documentation",
    image: "https://images.unsplash.com/photo-1734977112531-cb74329ce3d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Raj Kumar", role: "Customs Expert", avatar: "R" },
    date: "2025-01-10", readTime: 9,
    tags: ["Documentation", "Export", "Customs", "Compliance"],
  },
  {
    id: "7", slug: "cumin-seeds-gujarat-harvest-2025",
    title: "Gujarat Cumin Harvest 2025: What Importers Should Know",
    excerpt: "Early harvest data from Unjha suggests a bumper cumin crop. Here's how it affects global pricing and availability.",
    content: `Unjha, Gujarat — the world's largest cumin trading hub — is reporting excellent early harvest data for 2025. Favourable winter rainfall and improved farming practices are expected to yield 4.2 lakh metric tonnes, a 15% increase over 2024.\n\n**Price Impact**\nThe bumper harvest is expected to soften cumin prices by 8–12% from current levels of ₹380–420/kg at Unjha APMC.\n\n**Quality Assessment**\nEarly samples show excellent bold seed percentage (98%+), optimal moisture (8–9%), and strong essential oil content (2.8–3.2%).\n\n**Buyer Recommendation**\nThis is an excellent time for importers to contract Q3/Q4 cumin requirements at current prices before the fresh crop is fully absorbed into the market.`,
    category: "Export News",
    image: "https://images.unsplash.com/photo-1775433205046-86e060feff06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Vikas Thakkar", role: "Commodity Analyst", avatar: "V" },
    date: "2024-12-18", readTime: 4,
    tags: ["Cumin", "Gujarat", "Harvest", "Pricing"],
  },
  {
    id: "8", slug: "private-label-spice-packaging-guide",
    title: "Private Label Spice Packaging: A Guide for Retail Importers",
    excerpt: "How global retail chains and food brands can create private label spice lines with Indian export partners.",
    content: `Private label spice products offer retail chains and food brands significant margins over buying established brands. Working with an Indian B2B exporter for private label production is more accessible than most buyers assume.\n\n**What Private Label Involves**\n- Your brand name and logo on the packaging\n- Custom packaging design and materials\n- Your specified spice blend or product\n- Manufactured and packed in India to your spec\n\n**Minimum Order Quantities**\nTypically 500–1,000 kg per SKU for most powder spices. Some products available at 250 kg MOQ for trial orders.\n\n**Timeline**\n- Sample development: 2–3 weeks\n- Production: 4–6 weeks\n- Shipping: 3–5 weeks (sea freight)\n\n**Cost Advantages**\nPrivate label from India is typically 30–50% cheaper than equivalent branded products, allowing 60–80% retail margins for distributors.\n\n**What We Offer**\n- Retail sachets (10g–100g)\n- Bulk catering packs (1kg–5kg)\n- Food service containers\n- E-commerce ready packaging`,
    category: "Import/Export Guides",
    image: "https://images.unsplash.com/photo-1765118433463-93af73bc8ff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    author: { name: "Meera Iyer", role: "Brand Specialist", avatar: "M" },
    date: "2024-11-22", readTime: 6,
    tags: ["Private Label", "Packaging", "Retail", "Branding"],
  },
];
