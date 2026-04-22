const featuredProductsGrid = document.getElementById("featuredProductsGrid");

const renderFeaturedProducts = (products) => {
  if (!featuredProductsGrid) {
    return;
  }

  if (!products.length) {
    featuredProductsGrid.innerHTML = "<p class='error-message'>No featured products available right now.</p>";
    return;
  }

  featuredProductsGrid.innerHTML = products
    .map(
      (product) => `
        <article class="card">
          <a href="/product.html?id=${product._id}">
            <img class="card-media" src="${product.imageUrl}" alt="${product.name}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22220%22 height=%22165%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22220%22 height=%22165%22/%3E%3C/svg%3E'" />
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
    if (featuredProductsGrid) {
      featuredProductsGrid.innerHTML = '<div class="loading-skeleton"></div>';
    }
    const response = await window.HATTAH_API.apiRequest("/products");
    if (response && response.data) {
      renderFeaturedProducts(response.data.slice(0, 4));
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading featured products:", error);
    if (featuredProductsGrid) {
      featuredProductsGrid.innerHTML = `
        <div class="error-message">
          <p>Unable to load featured products</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #999;">Please try refreshing the page</p>
          <button onclick="location.reload()" style="margin-top: 0.75rem; padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer;">Refresh</button>
        </div>
      `;
    }
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
