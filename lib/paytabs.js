/**
 * PayTabs API helper functions
 * Documentation: https://developer.paytabs.com/docs/pt2-api-endpoints-integration-manual/
 */

// PayTabs API endpoints by region
const PAYTABS_ENDPOINTS = {
  global: "https://secure-global.paytabs.com/payment/request",
  saudi: "https://secure.paytabs.sa/payment/request",
  uae: "https://secure.paytabs.ae/payment/request",
  egypt: "https://secure-egypt.paytabs.com/payment/request",
  oman: "https://secure-oman.paytabs.com/payment/request",
  jordan: "https://secure-jordan.paytabs.com/payment/request",
}

/**
 * Get API URL for a region
 */
export function getApiUrl(region = "global") {
  return PAYTABS_ENDPOINTS[region] || PAYTABS_ENDPOINTS.global
}

/**
 * Create a PayLink using PayTabs Transaction API
 * This creates a hosted payment page where customers enter card details
 * 
 * @param {Object} params - Payment parameters
 * @param {string} params.profileId - PayTabs Profile ID
 * @param {string} params.serverKey - PayTabs Server Key
 * @param {string} params.region - PayTabs region (global, saudi, uae, egypt, oman, jordan)
 * @param {string} params.cartId - Unique cart/order identifier
 * @param {string} params.cartCurrency - 3 character currency code (e.g., "AED", "USD")
 * @param {number} params.cartAmount - Total amount due
 * @param {string} params.cartDescription - Description of items/services
 * @param {string} params.callback - Server-to-server webhook URL for payment notifications
 * @param {string} params.returnUrl - Browser redirect URL after payment completion
 * @returns {Promise<Object>} PayTabs API response with redirect_url for hosted payment page
 */
export async function createPayLink({
  profileId,
  serverKey,
  region = "global",
  cartId,
  cartCurrency,
  cartAmount,
  cartDescription,
  callback,
  returnUrl,
}) {
  const apiUrl = getApiUrl(region)
  
  const payload = {
    profile_id: profileId,
    tran_type: "sale",
    tran_class: "ecom",
    cart_id: cartId,
    cart_currency: cartCurrency,
    cart_amount: cartAmount,
    cart_description: cartDescription,
    callback: callback,
    return: returnUrl,
  }

  console.log("PayTabs Request to:", apiUrl)
  console.log("PayTabs Payload:", JSON.stringify(payload, null, 2))

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: serverKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    console.log("PayTabs Response:", JSON.stringify(data, null, 2))

    // PayTabs returns error codes even with 200 status
    if (data.code && data.code !== 200 && !data.redirect_url) {
      throw new Error(data.message || `PayTabs Error Code: ${data.code}`)
    }

    return data
  } catch (error) {
    console.error("PayTabs API error:", error)
    throw error
  }
}
