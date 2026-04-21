const exploreProductsGrid = document.getElementById("exploreProductsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const sortSelect = document.getElementById("sortSelect");
const resultsCount = document.getElementById("resultsCount");

let allProducts = [];

const getFilters = () => ({
  searchTerm: searchInput.value.trim().toLowerCase(),
  category: categoryFilter.value,
  minPrice: Number(minPriceInput.value) || 0,
  maxPrice: Number(maxPriceInput.value) || Infinity,
});

const renderProducts = (products) => {
  if (resultsCount) {
    resultsCount.textContent = `${products.length} product${
      products.length === 1 ? "" : "s"
    } found`;
  }

  if (!products.length) {
    exploreProductsGrid.innerHTML = "<p>No products match your filters.</p>";
    return;
  }

  exploreProductsGrid.innerHTML = products
    .map(
      (product) => `
        <article class="card">
          <a href="/product.html?id=${product._id}">
            <img class="card-media" src="${product.imageUrl}" alt="${product.name}" loading="lazy" />
            <div class="card-content">
              <h3 class="card-title">${product.name}</h3>
              <p class="card-meta">${product.category} · ${product.sellerName}</p>
              <div class="card-footer">
                <p class="price">${window.HATTAH_API.formatCurrency(product.price)}</p>
                <span class="badge">Request Order</span>
              </div>
            </div>
          </a>
        </article>
      `
    )
    .join("");
};

const sortProducts = (products) => {
  const selectedSort = sortSelect ? sortSelect.value : "featured";
  const sorted = [...products];

  switch (selectedSort) {
    case "priceLow":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "priceHigh":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "nameAsc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return sorted;
};

const applyFilters = () => {
  const { searchTerm, category, minPrice, maxPrice } = getFilters();

  const filtered = allProducts.filter((product) => {
    const textMatch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.sellerName.toLowerCase().includes(searchTerm);

    const categoryMatch = category ? product.category === category : true;
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;

    return textMatch && categoryMatch && priceMatch;
  });

  renderProducts(sortProducts(filtered));
};

const populateCategoryOptions = (products) => {
  const categories = [...new Set(products.map((product) => product.category))].sort();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
};

const loadProducts = async () => {
  try {
    const response = await window.HATTAH_API.apiRequest("/products");
    allProducts = response.data;
    populateCategoryOptions(allProducts);

    const initialCategory = new URLSearchParams(window.location.search).get("category");

    if (initialCategory) {
      categoryFilter.value = initialCategory;
    }

    applyFilters();
  } catch (error) {
    exploreProductsGrid.innerHTML = `<p>${error.message}</p>`;
  }
};

[searchInput, categoryFilter, minPriceInput, maxPriceInput, sortSelect].forEach((element) => {
  if (!element) {
    return;
  }

  element.addEventListener("input", applyFilters);
});

loadProducts();
