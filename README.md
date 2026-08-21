# Browear - Backend

This is the backend API for Browear, a men's fashion e-commerce application.

The backend is built with Node.js and Express.js and uses MongoDB as the database. It handles authentication, users, products, cart, wishlist, and order-related operations.

## Features

* User signup and login
* OTP verification
* JWT-based authentication
* Password hashing
* Protected API routes
* Product management
* Cart management
* Wishlist management
* Order management
* MongoDB database integration
* Centralized error handling
* CORS configuration

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JavaScript
* JWT
* bcryptjs
* dotenv
* CORS
* Nodemon

## Project Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

The exact folder structure may vary depending on the current implementation.

## Getting Started

### Clone the repository

```bash
git clone <your-repository-url>
```

### Move into the backend directory

```bash
cd backend
```

### Install dependencies

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

For production, update the values with your production configuration.

```env
PORT=5000
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-frontend-url.com
```

Do not commit the `.env` file to GitHub.

## MongoDB

Browear originally used MySQL for the database. The database has now been migrated to MongoDB.

The current backend uses Mongoose to connect the application with MongoDB.

The current architecture is:

```text
Node.js
   ↓
Express.js
   ↓
Mongoose
   ↓
MongoDB
```

MongoDB Atlas can be used for the production database.

A MongoDB connection string generally looks like:

```text
mongodb+srv://username:password@cluster.mongodb.net/browear
```

Add the connection string to the `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
```

## Authentication

Authentication is handled using JWT.

### Signup

```text
User Signup
     ↓
OTP Verification
     ↓
User Created
     ↓
JWT Token
```

### Login

```text
User Login
     ↓
Validate Credentials
     ↓
Generate JWT
     ↓
Return Token
```

Protected routes require the token in the Authorization header.

```text
Authorization: Bearer <token>
```

Passwords are hashed before being stored in the database.

## API Structure

The backend provides APIs for different parts of the application.

### Authentication

```text
POST /auth/signup
POST /auth/login
POST /auth/send-otp
POST /auth/verify-otp
GET  /auth/account
```

### Products

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

### Cart

```text
GET    /cart
POST   /cart
PUT    /cart/:id
DELETE /cart/:id
```

### Wishlist

```text
GET    /wishlist
POST   /wishlist
DELETE /wishlist/:id
```

### Orders

```text
POST /orders
GET  /orders
GET  /orders/:id
```

These endpoint names should match the routes currently implemented in the project.

## Running the Project

For development:

```bash
npm run dev
```

If Nodemon is configured, the server will automatically restart whenever changes are made.

For production:

```bash
npm start
```

The server will run on the port specified in the `.env` file.

## Testing the API

The APIs can be tested using Postman.

For protected endpoints, add the JWT token to the request headers:

```text
Authorization: Bearer <your-token>
```

Example login request:

```http
POST /auth/login
Content-Type: application/json
```

Example request body:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

## CORS

The backend is configured to accept requests from the frontend application.

The frontend URL can be configured through:

```env
CLIENT_URL=http://localhost:5173
```

For production, replace it with the deployed frontend URL.

## Database Migration

The first version of Browear used MySQL. The database was later migrated to MongoDB.

### Previous

```text
Node.js
   ↓
Express.js
   ↓
MySQL
```

### Current

```text
Node.js
   ↓
Express.js
   ↓
Mongoose
   ↓
MongoDB
```

The migration involved replacing the previous SQL-based database operations with MongoDB models and Mongoose queries.

The application's main functionality was maintained while changing the database layer.

## Production

Before deploying the backend:

1. Add the production MongoDB connection string.
2. Set a secure JWT secret.
3. Configure the production frontend URL.
4. Configure MongoDB Atlas network access.
5. Make sure CORS is configured correctly.
6. Test the API endpoints in production.

## Security

The backend follows basic security practices including:

* Password hashing
* JWT authentication
* Protected routes
* Environment variables for secrets
* CORS configuration
* Authentication middleware
* Centralized error handling

Sensitive values such as database credentials and JWT secrets should never be committed to the repository.

## Future Improvements

* Online payment integration
* Role-based authentication
* Admin authorization
* Product reviews
* Product search and filtering
* Pagination
* Inventory management
* Order status management
* Coupon management
* API rate limiting
* Request validation
* Logging and monitoring

## Author

Rajesh Podilapu

* Portfolio: https://rajeshpodilapu.vercel.app/
* GitHub: https://github.com/RajeshWebDev213
* LinkedIn: https://www.linkedin.com/in/rajesh-podilapu
