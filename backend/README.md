# AgentRise Backend API

RESTful API backend for AgentRise Insurance Portal built with Node.js, Express, and MySQL.

## Features

- 🔐 JWT-based authentication
- 👥 User management (Admin/Agent roles)
- 📊 CRM (Customers & Leads)
- 📋 Policy management
- 🎯 Campaign management
- ⚙️ Marketing automation rules
- 📈 Analytics & reporting
- 🤖 AI-powered gap analysis
- ⭐ Google Business Profile integration
- 🌐 Microsite builder
- 📰 News & testimonials
- 🔒 Security features (Helmet, CORS, Rate Limiting)

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **File Upload:** multer
- **AI Integration:** Google Gemini AI

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agentrise_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS (Frontend URL)
CORS_ORIGIN=http://localhost:5173
```

### 3. Create Database and Run Migrations

```bash
# Create database and tables
npm run db:migrate
```

This will:
- Create the `agentrise_db` database (if it doesn't exist)
- Create all tables from `database/schema.sql`

### 4. Seed Demo Data (Optional)

```bash
npm run db:seed
```

This creates demo data including:
- 2 users (admin & agent)
- 5 customers
- 4 leads
- 7 policies
- 3 campaigns
- 1 automation rule
- 3 testimonials
- 2 news articles

**Demo Credentials:**
- Admin: `admin@agentrise.com` / `password123`
- Agent: `agent@agentrise.com` / `password123`

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)
- `PUT /api/v1/auth/change-password` - Change password (protected)

### Users (Admin only)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Customers (Protected)

- `GET /api/v1/customers` - Get all customers (with pagination & filters)
- `GET /api/v1/customers/:id` - Get customer by ID
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer (Admin only)
- `POST /api/v1/customers/:id/timeline` - Add timeline entry

### Leads (Protected)

- `GET /api/v1/leads` - Get all leads
- `GET /api/v1/leads/:id` - Get lead by ID
- `POST /api/v1/leads` - Create lead
- `PUT /api/v1/leads/:id` - Update lead
- `DELETE /api/v1/leads/:id` - Delete lead (Admin only)
- `POST /api/v1/leads/:id/convert` - Convert lead to customer

### Policies (Protected)

- `GET /api/v1/policies` - Get all policies
- `GET /api/v1/policies/:id` - Get policy by ID
- `POST /api/v1/policies` - Create policy
- `PUT /api/v1/policies/:id` - Update policy
- `DELETE /api/v1/policies/:id` - Delete policy (Admin only)

### Campaigns (Protected)

- `GET /api/v1/campaigns` - Get all campaigns
- `GET /api/v1/campaigns/:id` - Get campaign by ID
- `POST /api/v1/campaigns` - Create campaign
- `PUT /api/v1/campaigns/:id` - Update campaign
- `DELETE /api/v1/campaigns/:id` - Delete campaign

### Automation (Protected)

- `GET /api/v1/automation/rules` - Get all automation rules
- `POST /api/v1/automation/rules` - Create automation rule
- `PUT /api/v1/automation/rules/:id` - Update rule
- `DELETE /api/v1/automation/rules/:id` - Delete rule

### Analytics (Protected)

- `GET /api/v1/analytics/dashboard` - Get dashboard statistics
- `GET /api/v1/analytics/revenue` - Get revenue analytics
- `GET /api/v1/analytics/lead-funnel` - Get lead funnel data

### Gap Analysis (Protected)

- `POST /api/v1/gap-analysis/upload` - Upload & analyze policy document
- `GET /api/v1/gap-analysis/customer/:customerId` - Get gap analysis for customer

### Google Business Profile (Protected)

- `GET /api/v1/gbp/locations` - Get all locations
- `GET /api/v1/gbp/locations/:locationId/reviews` - Get reviews for location
- `POST /api/v1/gbp/reviews/:reviewId/reply` - Reply to review

### Microsites (Protected)

- `GET /api/v1/microsites` - Get all microsites
- `GET /api/v1/microsites/:id` - Get microsite by ID
- `POST /api/v1/microsites` - Create microsite
- `PUT /api/v1/microsites/:id` - Update microsite
- `DELETE /api/v1/microsites/:id` - Delete microsite

### News (Public & Protected)

- `GET /api/v1/news` - Get all articles (public)
- `GET /api/v1/news/:id` - Get article by ID (public)
- `POST /api/v1/news` - Create article (protected)
- `PUT /api/v1/news/:id` - Update article (protected)
- `DELETE /api/v1/news/:id` - Delete article (protected)

### Testimonials (Public & Protected)

- `GET /api/v1/testimonials` - Get all testimonials (public)
- `POST /api/v1/testimonials` - Submit testimonial (public)
- `PUT /api/v1/testimonials/:id/status` - Update status (Admin only)
- `DELETE /api/v1/testimonials/:id` - Delete testimonial (Admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How to authenticate:

1. **Login** via `POST /api/v1/auth/login`:
```json
{
  "email": "agent@agentrise.com",
  "password": "password123"
}
```

2. **Response** includes `accessToken` and `refreshToken`:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

3. **Include token** in subsequent requests:
```
Authorization: Bearer <accessToken>
```

### Token Refresh

When access token expires, use refresh token:

```bash
POST /api/v1/auth/refresh
{
  "refreshToken": "<your_refresh_token>"
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Security Features

- ✅ Helmet.js (security headers)
- ✅ CORS protection
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Stricter rate limiting for login (5 attempts per 15 minutes)
- ✅ Password hashing (bcrypt with 12 rounds)
- ✅ JWT token expiration
- ✅ Input validation (express-validator)
- ✅ SQL injection prevention (parameterized queries)

## Database Schema

The database consists of 18 tables:

- **users** - User accounts (admin/agent)
- **user_sessions** - JWT refresh token tracking
- **customers** - Customer records
- **leads** - Sales leads
- **policies** - Insurance policies
- **policy_coverages** - Policy coverage details
- **timeline_entries** - Customer activity timeline
- **campaigns** - Marketing campaigns
- **campaign_leads** - Campaign-lead relationships
- **automation_rules** - Automation rule definitions
- **automation_rule_conditions** - Rule conditions
- **automation_rule_actions** - Rule actions
- **gbp_locations** - Google Business Profile locations
- **gbp_reviews** - Customer reviews
- **microsites** - Customer microsites
- **microsite_blocks** - Microsite content blocks
- **news_articles** - Blog/news articles
- **testimonials** - Customer testimonials
- **audit_logs** - System audit trail

See `database/schema.sql` for complete schema.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.js
│   │   ├── customer.controller.js
│   │   ├── lead.controller.js
│   │   └── ...
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── validate.js          # Validation middleware
│   ├── routes/                   # Route definitions
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   └── ...
│   ├── database/                 # Database utilities
│   │   ├── migrate.js           # Migration script
│   │   └── seed.js              # Seeding script
│   └── server.js                # Application entry point
├── database/
│   └── schema.sql               # Database schema
├── uploads/                     # File upload directory
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## Development

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
npm test
```

## Troubleshooting

### Database Connection Issues

If you see "Database connection failed":

1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```

2. Check credentials in `.env`
3. Ensure database exists or run migration:
   ```bash
   npm run db:migrate
   ```

### Port Already in Use

If port 5000 is in use, change `PORT` in `.env`:

```env
PORT=5001
```

### JWT Token Errors

If you get "Invalid token" errors:
1. Clear browser localStorage
2. Login again to get new tokens

## Production Deployment

### 1. Environment Variables

Set production environment variables:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_HOST=<production-db-host>
DB_PASSWORD=<strong-password>
CORS_ORIGIN=https://yourdomain.com
```

### 2. SSL/HTTPS

Use a reverse proxy (nginx) with SSL certificates:

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Process Manager

Use PM2 to keep server running:

```bash
npm install -g pm2
pm2 start src/server.js --name agentrise-api
pm2 save
pm2 startup
```

## License

MIT

## Support

For issues or questions, please contact the development team.
