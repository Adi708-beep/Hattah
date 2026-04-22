const productDetail = document.getElementById("productDetail");

const getProductId = () => new URLSearchParams(window.location.search).get("id");

const renderProduct = (product) => {
  productDetail.innerHTML = `
    <article class="card product-media-wrap">
      <img class="product-main-image" src="${product.imageUrl}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22%3EImage not available%3C/text%3E%3C/svg%3E'" />
    </article>

    <section class="card product-info-wrap">
      <p class="eyebrow">${product.category}</p>
      <h1 class="section-title">${product.name}</h1>
      <p class="price">${window.HATTAH_API.formatCurrency(product.price)}</p>
      <p class="section-subtitle">${product.description}</p>

      <div class="meta-grid">
        <div>
          <span>Seller</span>
          <strong>${product.sellerName}</strong>
        </div>
        <div>
          <span>Fulfillment</span>
          <strong>Direct by Seller</strong>
        </div>
        <div>
          <span>Order Type</span>
          <strong>Request Based</strong>
        </div>
      </div>

      <ul class="feature-list">
        <li>Curated product from independent brand</li>
        <li>No platform payment required</li>
        <li>Seller confirms details after request</li>
      </ul>

      <div class="button-group">
        <a class="btn btn-primary" href="/order.html?productId=${product._id}">Request Order</a>
        <a class="btn btn-outline" href="/explore.html">Back to Explore</a>
      </div>
    </section>
  `;
};

const renderError = (errorMessage) => {
  productDetail.innerHTML = `
    <div class="error-message" style="padding: 2rem; text-align: center;">
      <h2 style="color: var(--accent); margin-bottom: 1rem;">Unable to Load Product</h2>
      <p style="color: #999; margin-bottom: 1.5rem;">${errorMessage}</p>
      <a href="/explore.html" class="btn btn-primary">Browse Other Products</a>
    </div>
  `;
};

const renderLoading = () => {
  productDetail.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <div class="loading-skeleton" style="height: 400px; margin-bottom: 1rem;"></div>
      <p style="color: #999;">Loading product details...</p>
    </div>
  `;
};

const loadProduct = async () => {
  const productId = getProductId();

  if (!productId) {
    renderError("Product ID is missing from the URL. Please select a product from the catalog.");
    return;
  }

  renderLoading();

  try {
    console.log(`🔍 Loading product ${productId}...`);
    const response = await window.HATTAH_API.apiRequest(`/products/${productId}`);
    if (response && response.data) {
      console.log(`✅ Product loaded successfully`);
      renderProduct(response.data);
    } else {
      throw new Error("Invalid product data format");
    }
  } catch (error) {
    console.error("❌ Error loading product:", error.message);
    renderError(error.message || "Failed to load product details. Please try again.");
  }
};

loadProduct();
