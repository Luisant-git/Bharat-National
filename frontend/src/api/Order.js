// src/api/Order.js
const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}


export async function createOrder(payload) {
  const res = await fetch(`${API_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * Get all orders
 * GET /order
 * (Good for admin list page)
 */
export async function getOrders() {
  const res = await fetch(`${API_URL}/order`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * Get single order by id
 * GET /order/:id
 */
export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "GET",
  });

  return handleResponse(res);
}


export async function updateOrder(id, updates) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  return handleResponse(res);
}