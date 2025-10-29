# 🗄️ STRAPI SCHEMA SUGGESTIONS

## 📋 **Để checkout hoạt động tốt hơn, nên thêm:**

### **1. OrderItem Collection Type**
```javascript
// server/src/api/order-item/content-types/order-item/schema.json
{
  "kind": "collectionType",
  "collectionName": "order_items",
  "info": {
    "singularName": "order-item",
    "pluralName": "order-items",
    "displayName": "OrderItem"
  },
  "attributes": {
    "quantity": {
      "type": "integer",
      "required": true,
      "default": 1
    },
    "price": {
      "type": "decimal",
      "required": true
    },
    "order": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::order.order",
      "inversedBy": "order_items"
    },
    "product": {
      "type": "relation",
      "relation": "manyToOne", 
      "target": "api::product.product"
    }
  }
}
```

### **2. Cập nhật Order Model**
Thêm field `order_items` vào Order:
```javascript
"order_items": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::order-item.order-item",
  "mappedBy": "order"
}
```

### **3. Hoặc đơn giản hơn: Thêm fields vào Order**
```javascript
"order_details": {
  "type": "json",
  "required": false
}
```

## 🎯 **Lợi ích:**
- ✅ Lưu chi tiết quantity cho từng sản phẩm
- ✅ Lưu giá tại thời điểm mua (price history)
- ✅ Dễ quản lý và báo cáo
- ✅ Tương thích với schema hiện tại

## 🛠️ **Cách implement trong code:**

### **Nếu dùng OrderItem model:**
```javascript
// Tạo order với order_items
await createOrder({
  data: {
    email: user.primaryEmailAddress?.emailAddress,
    Username: user.fullName,
    amount,
    order_items: cartItems.map(item => ({
      quantity: item.attributes?.quantity || 1,
      price: item.attributes?.product?.data?.attributes?.price || 0,
      product: item.attributes?.product?.data?.id
    }))
  },
});
```

### **Nếu dùng JSON field:**
```javascript
// Lưu chi tiết vào order_details
await createOrder({
  data: {
    email: user.primaryEmailAddress?.emailAddress,
    Username: user.fullName, 
    amount,
    products: cartItems.map(item => item.attributes?.product?.data?.id),
    order_details: {
      items: cartItems.map(item => ({
        productId: item.attributes?.product?.data?.id,
        productTitle: item.attributes?.product?.data?.attributes?.title,
        quantity: item.attributes?.quantity || 1,
        price: item.attributes?.product?.data?.attributes?.price || 0,
        subtotal: (item.attributes?.quantity || 1) * (item.attributes?.product?.data?.attributes?.price || 0)
      })),
      totalAmount: amount,
      orderDate: new Date().toISOString()
    }
  },
});
```