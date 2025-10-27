# Productivity Manager - Backend API

A RESTful API server for the Personal Productivity Manager application, built with Node.js, Express, and MongoDB. This backend provides authentication, expense tracking, task management, and admin dashboard functionality.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (Access & Refresh Tokens)
- **Password Hashing:** bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── expense.controller.js
│   │   ├── task.controller.js
│   │   └── admin.controller.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── role.js       # Role-based access control
│   │   └── errorHandler.js
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Task.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── tasks.js
│   │   ├── dashboard.js
│   │   └── admin.js
│   ├── utils/            # Utility functions
│   │   └── jwt.js        # JWT token generation
│   ├── seed.js           # Database seeding script
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend root directory:

```env
MONGODB_URI=mongodb://localhost:27017/productivity-manager
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

Ensure MongoDB is running locally or use a cloud MongoDB instance (MongoDB Atlas).

For MongoDB Atlas:
1. Create a cluster
2. Get connection string
3. Replace `MONGODB_URI` in `.env`

### 4. Seed Database (Optional)

Run the seed script to populate demo data:

```bash
npm run seed
```

Default credentials:
- **Admin:** anegi@admin.com / Admin1234
- **User:** alice@user.com / User1234

### 5. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`).

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token

### Expenses (`/api/expenses`)

- `POST /` - Create expense
- `GET /` - List expenses (with filters, pagination)
- `GET /summary` - Get expense summary
- `GET /:id` - Get expense by ID
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense

**Query Parameters:**
- `page`, `limit` - Pagination
- `type` - Filter by type (income/expense)
- `category` - Filter by category
- `paymentMethod` - Filter by payment method
- `startDate`, `endDate` - Date range
- `minAmount`, `maxAmount` - Amount range
- `q` - Search keyword
- `sort` - Sort field (date/amount)
- `order` - Sort order (asc/desc)

### Tasks (`/api/tasks`)

- `POST /` - Create task
- `GET /` - List tasks (with filters, pagination)
- `GET /summary` - Get task summary
- `GET /:id` - Get task by ID
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `priority` - Filter by priority
- `startDue`, `endDue` - Due date range
- `q` - Search keyword
- `sort` - Sort field (dueDate/priority)
- `order` - Sort order (asc/desc)

### Dashboard (`/api/dashboard`)

- `GET /summary` - Get dashboard stats
- `GET /expenses-by-category` - Get category breakdown
- `GET /tasks-by-status` - Get status breakdown
- `GET /recent-activity` - Get recent expenses and tasks

### Admin (`/api/admin`)

All routes require admin role authentication.

- `GET /summary` - Get admin dashboard summary
- `GET /users` - Get all users
- `GET /expenses` - Get all expenses
- `GET /tasks` - Get all tasks

## Data Models

### User
- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, required, hashed)
- `role` (String, enum: ['user', 'admin'], default: 'user')
- `createdAt` (Date)

### Expense
- `title` (String, required)
- `amount` (Number, required)
- `type` (String, enum: ['income', 'expense'])
- `category` (String)
- `paymentMethod` (String)
- `date` (Date)
- `description` (String)
- `userId` (ObjectId, ref: User)
- `createdAt`, `updatedAt` (Date)

### Task
- `title` (String, required)
- `description` (String)
- `dueDate` (Date)
- `status` (String, enum: ['pending', 'in-progress', 'completed'])
- `priority` (String, enum: ['low', 'medium', 'high'])
- `category` (String)
- `userId` (ObjectId, ref: User)
- `createdAt`, `updatedAt` (Date)

## Authentication Flow

1. **Register/Login:** User receives access token and refresh token
2. **Access Token:** Short-lived (15 min), sent in Authorization header
3. **Refresh Token:** Long-lived (7 days), stored in httpOnly cookie
4. **Token Refresh:** Client calls `/refresh` to get new access token

## Middleware

- **`auth.js`:** Verifies JWT token and attaches user to request
- **`role.js`:** Checks user role for admin routes
- **`errorHandler.js`:** Global error handling

## Features

✅ JWT-based authentication
✅ Role-based access control
✅ CRUD operations for expenses and tasks
✅ Advanced filtering and pagination
✅ Analytics and aggregation
✅ Protected admin routes
✅ Error handling
✅ Input validation
✅ Password hashing with bcrypt

## Deployment

### Environment Variables for Production

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=strong_random_secret_here
JWT_REFRESH_SECRET=strong_random_refresh_secret_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
PORT=5000
NODE_ENV=production
```

### Recommended Platforms

- **Railway.app** - Easy MongoDB integration
- **Render.com** - Free tier available
- **Heroku** - Classic deployment platform
- **DigitalOcean** - VPS deployment

### Deploy to Railway

1. Connect your GitHub repository
2. Add environment variables
3. Deploy

### CORS Configuration

The backend is configured to accept requests from your frontend domain.

## Testing

Test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl
- Insomnia

## License

MIT

## Author

FlowTrack Development Team
