/**
 * 💼 Business Logic Functions
 * Các hàm xử lý logic nghiệp vụ (thuần JS, không phụ thuộc Strapi)
 */

/**
 * 💰 Tính tổng tiền order
 */
function calculateOrderTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

/**
 * 🏷️ Tính giá sau discount
 */
function calculateDiscountedPrice(price, discountPercent) {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100');
  }
  
  const discount = (price * discountPercent) / 100;
  return price - discount;
}

/**
 * 📊 Tính VAT
 */
function calculateVAT(subtotal, vatRate = 10) {
  if (subtotal < 0) {
    throw new Error('Subtotal cannot be negative');
  }
  
  const vat = (subtotal * vatRate) / 100;
  return {
    vat,
    total: subtotal + vat
  };
}

/**
 * 📦 Kiểm tra stock có đủ không
 */
function checkStockAvailable(currentStock, requestedQuantity) {
  if (currentStock < 0) {
    throw new Error('Stock cannot be negative');
  }
  
  return currentStock >= requestedQuantity;
}

/**
 * ⚠️ Kiểm tra stock có thấp không (cảnh báo)
 */
function isLowStock(currentStock, threshold = 5) {
  return currentStock < threshold;
}

/**
 * 📉 Tính stock mới sau khi bán
 */
function calculateNewStock(currentStock, soldQuantity) {
  if (currentStock < soldQuantity) {
    throw new Error('Not enough stock');
  }
  
  return currentStock - soldQuantity;
}

/**
 * ✅ Validate order data
 */
function validateOrderData(orderData) {
  const errors = [];
  
  if (!orderData.clerkUserId) {
    errors.push('clerkUserId is required');
  }
  
  if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
    errors.push('products array is required and must not be empty');
  }
  
  if (!orderData.order_items || !Array.isArray(orderData.order_items) || orderData.order_items.length === 0) {
    errors.push('order_items array is required and must not be empty');
  }
  
  if (orderData.total !== undefined && orderData.total < 0) {
    errors.push('total cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * ✅ Validate product data
 */
function validateProductData(productData) {
  const errors = [];
  
  if (!productData.title || productData.title.trim() === '') {
    errors.push('title is required');
  }
  
  if (productData.price === undefined || productData.price < 0) {
    errors.push('price must be >= 0');
  }
  
  if (productData.stock === undefined || productData.stock < 0) {
    errors.push('stock must be >= 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 🔢 Format giá tiền
 */
function formatPrice(price, currency = 'VND') {
  if (typeof price !== 'number') {
    throw new Error('Price must be a number');
  }
  
  if (currency === 'VND') {
    return price.toLocaleString('vi-VN') + ' $';  // Đổi từ ₫ thành $
  } else if (currency === 'USD') {
    return '$' + price.toFixed(2);
  }
  
  return price.toString();
}

module.exports = {
  calculateOrderTotal,
  calculateDiscountedPrice,
  calculateVAT,
  checkStockAvailable,
  isLowStock,
  calculateNewStock,
  validateOrderData,
  validateProductData,
  formatPrice,
};
