/* Main form for API interaction */ 

import fetch from "node-fetch";

// Base URL for the Books Form RESTful API
const API_BASE_URL = "https://comp2140a3.uqcloud.net/api";

// JWT token for authorization, replace with your actual token from My Grades in Blackboard
// From the A2 JSON Web Token column, view Feedback to show your JWT
// The JWT for A3 is the same as A2
const JWT_TOKEN = process.env.EXPO_PUBLIC_JWT_TOKEN;

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = "s4703754";

/**
 * Helper function to handle API requests. Added a sigal abort handler for when user 
 * does not want the data anymore by clicking off the page. 
 * It sets the Authorization token and optionally includes the request body.
 * 
 * @param {string} endpoint - The API endpoint to call (e.g., "/form", "/field").
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH).
 * @param {object|null} [body=null] - The request body to send, typically for POST or PATCH.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is not OK.
 */
export async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`, // Include the JWT token for authentication
    },
  };

  // If the method is POST or PATCH, we want the response to include the full representation
  if (method === "POST" || method === "PATCH") {
    options.headers["Prefer"] = "return=representation";
  }

  // If a body is provided, add it to the request and include the username
  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }
  // Make the API request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} – ${errText}`);
  }

  // parse if JSON, otherwise return null
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("application/json")) return response.json();
  return {};
}

async function insertField(formId, field) {
  return apiRequest("/field", "POST", {
    ...field,
    form_id: formId,
  });
}

