const featuredProductsGrid = document.getElementById("featuredProductsGrid");

const renderFeaturedProducts = (products) => {
  if (!featuredProductsGrid) {
    return;
  }

  if (!products.length) {
    featuredProductsGrid.innerHTML = "<p>No featured products available right now.</p>";
    return;
  }

  featuredProductsGrid.innerHTML = products
    .map(
      (product) => `
        <article class="card">
          <a href="/product.html?id=${product._id}">
            <img class="card-media" src="${product.imageUrl}" alt="${product.name}" loading="lazy" />
            <div class="card-content">
              <h3 class="card-title">${product.name}</h3>
              <p class="card-meta">by ${product.sellerName}</p>
              <div class="card-footer">
                <p class="price">${window.HATTAH_API.formatCurrency(product.price)}</p>
                <span class="badge">${product.category}</span>
              </div>
            </div>
          </a>
        </article>
      `
    )
    .join("");
};

const loadFeaturedProducts = async () => {
  try {
    const response = await window.HATTAH_API.apiRequest("/products");
    renderFeaturedProducts(response.data.slice(0, 4));
  } catch (error) {
    featuredProductsGrid.innerHTML = `<p>${error.message}</p>`;
  }
};

const categoryChips = document.querySelectorAll("[data-category]");

categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const category = chip.getAttribute("data-category");
    window.location.href = `/explore.html?category=${encodeURIComponent(category)}`;
  });
});

loadFeaturedProducts();
