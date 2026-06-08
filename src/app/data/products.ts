export interface Product {
  id: string;
  name: string;
  category: "whole-spices" | "powder-spices" | "oil-seeds" | "cereals" | "cocopeat" | "dehydrated";
  shortDescription: string;
  description: string;
  image: string;
  moq: string;
  packaging: string[];
  specifications: { label: string; value: string }[];
  origin: string;
  shelfLife: string;
  hsnCode: string;
  exportCountries: string[];
}

export const products: Product[] = [
  {
    id: "turmeric-powder",
    name: "Turmeric Powder",
    category: "powder-spices",
    shortDescription: "Premium quality golden turmeric with high curcumin content.",
    description:
      "Tanzora's Turmeric Powder is sourced from the finest Erode and Rajapuri varieties, renowned worldwide for their rich golden color and high curcumin content (3–5%). Processed under strict hygiene standards and exported globally.",
    image: "/images/turmeric-powder.jpg.jpeg",
    moq: "500 kg",
    packaging: ["25 kg PP Bags", "50 kg PP Bags", "Custom Packaging Available"],
    specifications: [
      { label: "Curcumin Content", value: "3–5%" },
      { label: "Moisture", value: "Max 10%" },
      { label: "Color Value (ASTA)", value: "≥ 20" },
      { label: "Total Ash", value: "Max 7%" },
      { label: "Mesh Size", value: "40–60 Mesh" },
    ],
    origin: "Erode, Tamil Nadu / Rajasthan, India",
    shelfLife: "24 Months",
    hsnCode: "0910 30 10",
  },
  {
    id: "chilli-powder",
    name: "Chilli Powder",
    category: "powder-spices",
    shortDescription: "Vibrant red chilli with intense color and heat.",
    description:
      "Our Chilli Powder is prepared from selected Teja, Byadagi, and Kashmiri varieties. Known for its deep red color and ideal pungency level, it is widely used in food processing industries worldwide.",
    image: "https://images.unsplash.com/photo-1625921133217-8d978f7872b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsaSUyMHJlZCUyMHBvd2RlciUyMHNwaWNlJTIwbWFya2V0fGVufDF8fHx8MTc3ODU3NDkwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    moq: "500 kg",
    packaging: ["25 kg PP Bags", "50 kg PP Bags", "Custom Packaging Available"],
    specifications: [
      { label: "ASTA Color Value", value: "80–200+" },
      { label: "Scoville Heat Units", value: "5,000–50,000 SHU" },
      { label: "Moisture", value: "Max 10%" },
      { label: "Total Ash", value: "Max 8.5%" },
    ],
    origin: "Guntur, Andhra Pradesh, India",
    shelfLife: "18 Months",
    hsnCode: "0904 22 19",
  },
  {
    id: "black-pepper",
    name: "Black Pepper",
    category: "whole-spices",
    shortDescription: "King of spices – bold aroma and robust flavor.",
    description:
      "Known as the 'King of Spices', our Black Pepper is sourced from Kerala's Malabar Coast. Available in whole, cracked, and ground formats, it offers a bold aroma and robust flavor that is in high demand across global food industries.",
    image: "/images/Black-pepper-benefits.jpg.webp",
    moq: "250 kg",
    packaging: ["10 kg Cartons", "25 kg PP Bags", "50 kg Jute Bags"],
    specifications: [
      { label: "Piperine Content", value: "Min 4%" },
      { label: "Bulk Density", value: "550–600 g/L" },
      { label: "Moisture", value: "Max 12%" },
      { label: "Admixture", value: "Max 1%" },
    ],
    origin: "Wayanad / Idukki, Kerala, India",
    shelfLife: "36 Months",
    hsnCode: "0904 11 00",
  },
  {
    id: "cumin-seeds",
    name: "Cumin Seeds",
    category: "seeds",
    shortDescription: "Aromatic cumin seeds from Gujarat's finest farms.",
    description:
      "Tanzora's Cumin Seeds are sourced from Unjha, Gujarat — India's largest cumin trading hub. Rich in essential oils and earthy aroma, these seeds are a cornerstone of Middle Eastern, European, and Asian cuisine.",
    image: "/images/cumin1_1000x.jpg.jpeg",
    moq: "500 kg",
    packaging: ["25 kg PP Bags", "50 kg PP Bags", "Bulk Containers"],
    specifications: [
      { label: "Essential Oil Content", value: "Min 2.5%" },
      { label: "Moisture", value: "Max 9%" },
      { label: "Admixture", value: "Max 1%" },
      { label: "Bold Seeds", value: "Min 98%" },
    ],
    origin: "Unjha, Gujarat, India",
    shelfLife: "24 Months",
    hsnCode: "0909 21 00",
  },
  {
    id: "coriander-powder",
    name: "Coriander Powder",
    category: "powder-spices",
    shortDescription: "Finely ground coriander with a warm citrusy fragrance.",
    description:
      "Our Coriander Powder is made from premium Eagle variety coriander seeds, offering a distinctive warm citrus aroma. Popular in Europe, the Middle East, and Southeast Asia for its versatile culinary applications.",
    image: "/images/coriander-powder.jpg.jpeg",
    moq: "500 kg",
    packaging: ["25 kg PP Bags", "50 kg PP Bags"],
    specifications: [
      { label: "Volatile Oil", value: "Min 0.3 ml/100g" },
      { label: "Moisture", value: "Max 9%" },
      { label: "Mesh Size", value: "40–60 Mesh" },
      { label: "Total Ash", value: "Max 7%" },
    ],
    origin: "Rajasthan / Gujarat, India",
    shelfLife: "18 Months",
    hsnCode: "0909 21 00",
  },
  {
    id: "cloves",
    name: "Cloves",
    category: "whole-spices",
    shortDescription: "Aromatic cloves with high eugenol content.",
    description:
      "Premium grade cloves sourced from Kerala and Tamil Nadu. Our cloves have high eugenol content (70–85%), making them highly valued by pharmaceutical, food, and fragrance industries worldwide.",
    image: "/images/cloves.jpg.webp",
    moq: "100 kg",
    packaging: ["10 kg Cartons", "25 kg PP Bags", "Custom Packaging"],
    specifications: [
      { label: "Eugenol Content", value: "70–85%" },
      { label: "Moisture", value: "Max 12%" },
      { label: "Oil Content", value: "Min 15%" },
      { label: "Admixture", value: "Max 0.5%" },
    ],
    origin: "Kerala / Tamil Nadu, India",
    shelfLife: "36 Months",
    hsnCode: "0907 10 00",
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    category: "whole-spices",
    shortDescription: "True cinnamon sticks with sweet warm aroma.",
    description:
      "Tanzora's Cinnamon sticks come in both Ceylon (True Cinnamon) and Cassia varieties. With a naturally sweet and warm aroma, our cinnamon is widely exported to bakery, beverage, and pharmaceutical sectors.",
    image: "/images/Cinnamon.jpg.jpeg",
    moq: "250 kg",
    packaging: ["10 kg Cartons", "25 kg PP Bags"],
    specifications: [
      { label: "Cinnamaldehyde", value: "Min 55%" },
      { label: "Moisture", value: "Max 13%" },
      { label: "Oil Content", value: "Min 1%" },
      { label: "Available Grades", value: "C4, C5, C6, Quillings" },
    ],
    origin: "Kerala / Sri Lanka (Ceylon)",
    shelfLife: "36 Months",
    hsnCode: "0906 11 00",
  },
  {
    id: "ajwain-seeds",
    name: "Ajwain Seeds",
    category: "seeds",
    shortDescription: "Pungent carom seeds rich in thymol – a digestive powerhouse.",
    description:
      "Ajwain (Carom Seeds) from Rajasthan are prized for their high thymol content (35–60%), making them essential in pharmaceutical and food industries. Known for strong aroma and digestive properties.",
    image: "/images/Ajwain-Seeds.jpg.jpeg",
    moq: "500 kg",
    packaging: ["25 kg PP Bags", "50 kg PP Bags"],
    specifications: [
      { label: "Thymol Content", value: "35–60%" },
      { label: "Moisture", value: "Max 9%" },
      { label: "Admixture", value: "Max 1%" },
      { label: "Oil Content", value: "Min 2%" },
    ],
    origin: "Rajasthan / Gujarat, India",
    shelfLife: "24 Months",
    hsnCode: "0909 61 00",
  },
  {
    id: "white-pepper",
    name: "White Pepper",
    category: "whole-spices",
    shortDescription: "Milder white pepper ideal for light-colored dishes.",
    description:
      "Tanzora's White Pepper is produced from fully ripe black pepper berries with the outer husk removed. Offering a milder, more refined heat, it is preferred by European chefs, food manufacturers, and pharmaceutical industries.",
    image: "/images/white-pepper-whole.jpg.jpeg",
    moq: "250 kg",
    packaging: ["10 kg Cartons", "25 kg PP Bags"],
    specifications: [
      { label: "Piperine Content", value: "Min 4%" },
      { label: "Moisture", value: "Max 14%" },
      { label: "Admixture", value: "Max 1%" },
      { label: "Available Type", value: "Whole / Ground" },
    ],
    origin: "Kerala, India",
    shelfLife: "36 Months",
    hsnCode: "0904 12 00",
  },
  {
    id: "garam-masala",
    name: "Garam Masala",
    category: "masala",
    shortDescription: "Authentic blend of whole spices for rich, layered flavor.",
    description:
      "Our Garam Masala is a premium spice blend crafted from the finest whole spices including cinnamon, cardamom, cloves, black pepper, cumin, and more. Perfect for food manufacturers and restaurant chains.",
    image: "/images/Garam-Masala.jpg.jpeg",
    moq: "500 kg",
    packaging: ["25 kg PP Bags", "Custom Retail Packaging"],
    specifications: [
      { label: "Blend Type", value: "Classic / Special / Restaurant Grade" },
      { label: "Moisture", value: "Max 10%" },
      { label: "Mesh Size", value: "40–60 Mesh" },
      { label: "Packaging Gas Flushing", value: "Available" },
    ],
    origin: "Gujarat / Rajasthan, India",
    shelfLife: "18 Months",
    hsnCode: "0910 91 10",
  },
];

export const categoryLabels: Record<Product["category"], string> = {
  "whole-spices": "Whole Spices",
  "powder-spices": "Powder Spices",
  seeds: "Seeds",
  masala: "Masala Products",
};
