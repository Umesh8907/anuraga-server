# 🌿 Anuraga Organic E-Commerce Backend

A robust, production-ready backend API for an organic e-commerce platform. Built with **Node.js**, **Express**, and **MongoDB**, designed for scalability, security, and performance.

## ✨ Key Features

### 🛒 Core E-Commerce
*   **Product Management**: CRUD operations for products with variants, stock management, and categorization.
*   **Collections**: Organize products into curated collections (e.g., "Best Sellers", "New Arrivals").
*   **Smart Search**: Full-text search for products by name or description.
*   **Shopping Cart**: Persistent cart management with stock validation.
*   **Orders**: Order placement, tracking, and history.

### 👤 User Experience (UX)
*   **Wishlist**: Save favorite items for later.
*   **Reviews & Ratings**: Users can rate and review products; average rating is automatically calculated.
*   **User Profiles**: Manage profile details and addresses.

### 🔐 Security & Auth
*   **Authentication**: Secure JWT-based auth (Access + Refresh tokens).
*   **Account Recovery**: Forgot/Reset password functionality.
*   **Role-Based Access**: strict separation between User and Admin routes.

### 💳 Payments
*   **Razorpay Integration**: Secure online payments.
*   **Cash on Delivery**: Supported payment method.

### 🛠️ Admin Dashboard
*   **Analytics**: Dashboard statistics (Total Sales, Revenue, Order Status).
*   **Management**: Full control over Products, Collections, and Orders.

---

## 🚀 Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt
*   **Documentation**: Swagger / OpenAPI 3.0
*   **Payments**: Razorpay SDK
*   **Validation**: Joi / Custom Validators

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd anuraga-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000

# Payments (Optional for dev)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 4. Run the Server
```bash
# Development Mode (with Nodemon)
npm run dev

# Production Build
npm start
```

---

## 📚 API Documentation

Complete API documentation is available via **Swagger UI**.

1.  Start the server.
2.  Visit: `http://localhost:4000/api-docs`

---

## 🧪 Testing

We have a comprehensive testing guide available.
👉 [View Testing Guide](./TESTING.md)

---

## 📂 Project Structure

```
src/
├── config/         # Environment & DB config
├── loaders/        # Express app loaders
├── middlewares/    # Auth, Error handling
├── modules/        # Feature-based modules (Controller, Service, Model, Routes)
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── ...
├── routes.js       # Main API router
├── server.js       # Entry point
└── app.js          # App setup
```

---

## 📄 License
This project is licensed under the MIT License.
