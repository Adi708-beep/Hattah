const DEFAULT_PRODUCTS = [
  {
    _id: "1",
    name: "Handmade Linen Tote",
    price: 1299,
    description:
      "Soft linen everyday tote with reinforced handles, handcrafted in small batches.",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80",
    category: "Bags",
    sellerName: "ThreadRoot Studio",
  },
  {
    _id: "2",
    name: "Minimal Clay Mug Set",
    price: 999,
    description:
      "Set of two wheel-thrown ceramic mugs with matte glaze and comfortable grip.",
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80",
    category: "Home",
    sellerName: "EarthKind Pottery",
  },
  {
    _id: "3",
    name: "Organic Face Serum",
    price: 1499,
    description: "Lightweight botanical serum made for daily hydration and glow.",
    imageUrl:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80",
    category: "Beauty",
    sellerName: "Luma Herbals",
  },
  {
    _id: "4",
    name: "Block Print Summer Shirt",
    price: 1799,
    description: "Breathable cotton shirt featuring hand block print patterns.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
    category: "Fashion",
    sellerName: "Indigo Alley",
  },
  {
    _id: "5",
    name: "Desk Plant Starter Kit",
    price: 799,
    description:
      "Low-maintenance indoor plant kit with ceramic pot and care guide.",
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80",
    category: "Home",
    sellerName: "GreenLittle Co",
  },
  {
    _id: "6",
    name: "Sterling Silver Charm Anklet",
    price: 2199,
    description:
      "Delicate handcrafted anklet in sterling silver with tiny charm details.",
    imageUrl:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=80",
    category: "Accessories",
    sellerName: "MoonMint Atelier",
  },
];

const findDefaultProductById = (productId) =>
  DEFAULT_PRODUCTS.find((product) => String(product._id) === String(productId));

module.exports = {
  DEFAULT_PRODUCTS,
  findDefaultProductById,
};