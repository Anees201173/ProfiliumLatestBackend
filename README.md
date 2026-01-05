# ProfiliumBackend

Node.js backend application with PostgreSQL (Neon Database) and Sequelize ORM.

## 🚀 Features

- ✅ Node.js + Express.js
- ✅ PostgreSQL with Neon Database
- ✅ Sequelize ORM
- ✅ JWT Authentication
- ✅ Input Validation
- ✅ Error Handling
- ✅ Clean Architecture

## 📁 Project Structure

```
ProfiliumBackend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Sequelize models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── migrations/          # Database migrations
├── seeders/            # Database seeders
├── tests/              # Test files
└── server.js           # Entry point
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your Neon database credentials:

```bash
cp .env.example .env
```

Update the `.env` file with your Neon database connection string:

```env
DATABASE_URL=postgresql://user:password@your-neon-hostname/database_name?sslmode=require
PORT=5000
JWT_SECRET=your_secret_key
```

### 3. Run Migrations (Optional)

```bash
npm run migrate
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Users
```
GET    /api/users       - Get all users
GET    /api/users/:id   - Get user by ID
POST   /api/users       - Create new user
PUT    /api/users/:id   - Update user
DELETE /api/users/:id   - Delete user
```

## 🗄️ Database (Neon PostgreSQL)

This project uses Neon Database - a serverless PostgreSQL database.

- Get your connection string from [Neon Console](https://console.neon.tech)
- SSL is enabled by default for secure connections
- Connection pooling is handled automatically

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Rollback last migration
- `npm run seed` - Run database seeders

## 🔧 Key Files Explained

- **server.js** - Application entry point, starts the server
- **src/app.js** - Express app configuration and middleware setup
- **src/config/database.js** - Sequelize configuration for Neon DB
- **src/models/index.js** - Sequelize initialization and model associations
- **.sequelizerc** - Sequelize CLI configuration

## 🌟 Next Steps

1. Add authentication endpoints (login, register)
2. Create more models and controllers
3. Add unit and integration tests
4. Implement rate limiting
5. Add API documentation (Swagger)
6. Set up CI/CD pipeline

## 📚 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM
- **PostgreSQL** - Database (via Neon)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📄 License

ISC
