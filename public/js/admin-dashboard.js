const ordersTableBody = document.getElementById("ordersTableBody");
const sellersTableBody = document.getElementById("sellersTableBody");
const statusSummary = document.getElementById("statusSummary");
const ordersAlert = document.getElementById("ordersAlert");
const orderSearch = document.getElementById("orderSearch");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const prevPageButton = document.getElementById("prevPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const paginationInfo = document.getElementById("paginationInfo");
const refreshOrdersButton = document.getElementById("refreshOrdersButton");
const logoutButton = document.getElementById("logoutButton");
const adminEmailDisplay = document.getElementById("adminEmailDisplay");

const metricOrders = document.getElementById("metricOrders");
const metricProducts = document.getElementById("metricProducts");
const metricSellers = document.getElementById("metricSellers");
const metricRevenue = document.getElementById("metricRevenue");

const state = {
  page: 1,
  pages: 1,
  limit: 12,
  search: "",
  status: "all",
};

const statusClassMap = {
  new: "status-new",
  processing: "status-processing",
  fulfilled: "status-fulfilled",
  cancelled: "status-cancelled",
};

const requireAdminSession = async () => {
  const token = window.HATTAH_API.getAdminToken();

  if (!token) {
    window.location.href = "/admin-login.html";
    return false;
  }

  try {
    await window.HATTAH_API.apiRequest("/admin/overview", { auth: true });
    return true;
  } catch (error) {
    window.HATTAH_API.clearAdminSession();
    window.location.href = "/admin-login.html";
    return false;
  }
};

const showOrdersAlert = (message, isError = false) => {
  ordersAlert.className = `alert ${isError ? "error" : "success"}`;
  ordersAlert.textContent = message;
};

const clearOrdersAlert = () => {
  ordersAlert.className = "alert";
  ordersAlert.textContent = "";
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (order) => {
  const price = order.productId && order.productId.price ? order.productId.price : 0;
  const total = price * order.quantity;
  return window.HATTAH_API.formatCurrency(total);
};

const renderStatusSummary = (summary) => {
  statusSummary.innerHTML = `
    <div class="status-pill">New: ${summary.new || 0}</div>
    <div class="status-pill">Processing: ${summary.processing || 0}</div>
    <div class="status-pill">Fulfilled: ${summary.fulfilled || 0}</div>
    <div class="status-pill">Cancelled: ${summary.cancelled || 0}</div>
  `;
};

const renderOrders = (orders) => {
  if (!orders.length) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7">No orders found for selected filters.</td>
      </tr>
    `;
    return;
  }

  ordersTableBody.innerHTML = orders
    .map((order) => {
      const productName = order.productId && order.productId.name ? order.productId.name : "Removed Product";
      const sellerName =
        order.productId && order.productId.sellerName ? order.productId.sellerName : "Unknown Seller";
      const normalizedStatus = order.orderStatus || "new";
      const statusClass = statusClassMap[normalizedStatus] || "status-new";

      return `
        <tr>
          <td>
            <strong>${order.customerName}</strong>
            <div class="small">Qty: ${order.quantity}</div>
          </td>
          <td>
            <div>${order.customerEmail || "-"}</div>
            <div>${order.phone}</div>
            <div class="small">${order.address}</div>
          </td>
          <td>
            <strong>${productName}</strong>
            <div class="small">Seller: ${sellerName}</div>
          </td>
          <td>${formatAmount(order)}</td>
          <td>
            <span class="order-status ${statusClass}">${normalizedStatus}</span>
          </td>
          <td>${formatDate(order.createdAt)}</td>
          <td>
            <div class="inline-actions" data-order-id="${order._id}">
              <select class="form-control" data-role="status">
                <option value="new" ${normalizedStatus === "new" ? "selected" : ""}>New</option>
                <option value="processing" ${normalizedStatus === "processing" ? "selected" : ""}>Processing</option>
                <option value="fulfilled" ${normalizedStatus === "fulfilled" ? "selected" : ""}>Fulfilled</option>
                <option value="cancelled" ${normalizedStatus === "cancelled" ? "selected" : ""}>Cancelled</option>
              </select>
              <input
                class="form-control"
                type="text"
                value="${order.adminNotes || ""}"
                placeholder="Admin note"
                data-role="note"
              />
              <button class="btn-ghost" type="button" data-role="save">Update</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
};

const renderSellers = (sellers) => {
  if (!sellers.length) {
    sellersTableBody.innerHTML = `
      <tr>
        <td colspan="6">No seller applications yet.</td>
      </tr>
    `;
    return;
  }

  sellersTableBody.innerHTML = sellers
    .map(
      (seller) => `
        <tr>
          <td>${seller.brandName}</td>
          <td>${seller.instagramHandle}</td>
          <td>${seller.category}</td>
          <td>${seller.contactInfo}</td>
          <td><a href="${seller.sampleProductLink}" target="_blank" rel="noreferrer">View</a></td>
          <td>${formatDate(seller.createdAt)}</td>
        </tr>
      `
    )
    .join("");
};

const loadOverview = async () => {
  const response = await window.HATTAH_API.apiRequest("/admin/overview", {
    auth: true,
  });

  const { metrics, statusSummary: summary } = response.data;

  metricOrders.textContent = metrics.totalOrders;
  metricProducts.textContent = metrics.totalProducts;
  metricSellers.textContent = metrics.totalSellers;
  metricRevenue.textContent = window.HATTAH_API.formatCurrency(metrics.pipelineRevenue || 0);

  renderStatusSummary(summary);
};

const loadOrders = async () => {
  const params = new URLSearchParams({
    page: String(state.page),
    limit: String(state.limit),
    status: state.status,
  });

  if (state.search) {
    params.set("search", state.search);
  }

  const response = await window.HATTAH_API.apiRequest(`/admin/orders?${params.toString()}`, {
    auth: true,
  });

  renderOrders(response.data);
  renderStatusSummary(response.statusSummary);

  state.pages = response.pagination.pages;
  paginationInfo.textContent = `Page ${response.pagination.page} of ${response.pagination.pages}`;
  prevPageButton.disabled = response.pagination.page <= 1;
  nextPageButton.disabled = response.pagination.page >= response.pagination.pages;
};

const loadSellers = async () => {
  const response = await window.HATTAH_API.apiRequest("/admin/sellers", {
    auth: true,
  });

  renderSellers(response.data);
};

const refreshAllData = async () => {
  clearOrdersAlert();

  try {
    await Promise.all([loadOverview(), loadOrders(), loadSellers()]);
  } catch (error) {
    showOrdersAlert(error.message, true);
  }
};

const updateOrder = async (orderId, status, note) => {
  try {
    await window.HATTAH_API.apiRequest(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({
        orderStatus: status,
        adminNotes: note,
      }),
    });

    showOrdersAlert("Order updated successfully.");
    await Promise.all([loadOrders(), loadOverview()]);
  } catch (error) {
    showOrdersAlert(error.message, true);
  }
};

ordersTableBody.addEventListener("click", async (event) => {
  if (event.target.getAttribute("data-role") !== "save") {
    return;
  }

  const actionWrap = event.target.closest(".inline-actions");

  if (!actionWrap) {
    return;
  }

  const orderId = actionWrap.getAttribute("data-order-id");
  const status = actionWrap.querySelector("[data-role='status']").value;
  const note = actionWrap.querySelector("[data-role='note']").value;

  await updateOrder(orderId, status, note);
});

orderSearch.addEventListener("input", () => {
  state.search = orderSearch.value.trim();
  state.page = 1;
  loadOrders().catch((error) => showOrdersAlert(error.message, true));
});

orderStatusFilter.addEventListener("change", () => {
  state.status = orderStatusFilter.value;
  state.page = 1;
  loadOrders().catch((error) => showOrdersAlert(error.message, true));
});

prevPageButton.addEventListener("click", () => {
  if (state.page <= 1) {
    return;
  }

  state.page -= 1;
  loadOrders().catch((error) => showOrdersAlert(error.message, true));
});

nextPageButton.addEventListener("click", () => {
  if (state.page >= state.pages) {
    return;
  }

  state.page += 1;
  loadOrders().catch((error) => showOrdersAlert(error.message, true));
});

refreshOrdersButton.addEventListener("click", () => {
  refreshAllData();
});

logoutButton.addEventListener("click", () => {
  window.HATTAH_API.clearAdminSession();
  window.location.href = "/admin-login.html";
});

const init = async () => {
  const isLoggedIn = await requireAdminSession();

  if (!isLoggedIn) {
    return;
  }

  const profile = window.HATTAH_API.getAdminProfile();

  if (profile && profile.email) {
    adminEmailDisplay.textContent = profile.email;
  }

  await refreshAllData();
};

init();
