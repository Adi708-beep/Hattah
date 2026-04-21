const productDetail = document.getElementById("productDetail");

const getProductId = () => new URLSearchParams(window.location.search).get("id");

const renderProduct = (product) => {
  productDetail.innerHTML = `
    <article class="card product-media-wrap">
      <img class="product-main-image" src="${product.imageUrl}" alt="${product.name}" />
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

const loadProduct = async () => {
  const productId = getProductId();

  if (!productId) {
    productDetail.innerHTML = "<p>Product id is missing from the URL.</p>";
    return;
  }

  try {
    const response = await window.HATTAH_API.apiRequest(`/products/${productId}`);
    renderProduct(response.data);
  } catch (error) {
    productDetail.innerHTML = `<p>${error.message}</p>`;
  }
};

loadProduct();
