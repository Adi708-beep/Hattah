const orderForm = document.getElementById("orderForm");
const orderMessage = document.getElementById("orderMessage");
const productIdInput = document.getElementById("productId");
const orderProductInfo = document.getElementById("orderProductInfo");

const showOrderMessage = (text, isError = false) => {
  orderMessage.className = `message ${isError ? "error" : "success"}`;
  orderMessage.textContent = text;
};

const initializeOrderPage = async () => {
  const productId = new URLSearchParams(window.location.search).get("productId");

  if (!productId) {
    showOrderMessage("Missing product id. Please request an order from the product page.", true);
    orderForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  productIdInput.value = productId;

  try {
    const response = await window.HATTAH_API.apiRequest(`/products/${productId}`);
    const product = response.data;

    orderProductInfo.innerHTML = `
      <img class="product-main-image" src="${product.imageUrl}" alt="${product.name}" />
      <h3 class="card-title mt-9">${product.name}</h3>
      <p class="card-meta">Seller: ${product.sellerName}</p>
      <div class="card-footer">
        <p class="price">${window.HATTAH_API.formatCurrency(product.price)}</p>
        <span class="badge">${product.category}</span>
      </div>
    `;
  } catch (error) {
    showOrderMessage(error.message, true);
  }
};

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(orderForm);
  const payload = {
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    quantity: Number(formData.get("quantity")),
    notes: formData.get("notes"),
    productId: formData.get("productId"),
  };

  try {
    const response = await window.HATTAH_API.apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    orderForm.reset();
    productIdInput.value = payload.productId;

    if (response.data && response.data.emailSent) {
      showOrderMessage(
        "Order placed successfully. A confirmation email has been sent to your inbox."
      );
      return;
    }

    showOrderMessage(
      "Order placed successfully. Seller will contact you soon, and confirmation email is pending."
    );
  } catch (error) {
    showOrderMessage(error.message, true);
  }
});

initializeOrderPage();
