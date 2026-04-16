# Trinity - Tailoring E-learning & E-commerce Platform

A premium platform for tailoring education combining structured learning (courses) with a boutique shopping experience (products).

## Tech Stack

- **Frontend**: React.js (Vite), Vanilla CSS, Framer Motion
- **Backend**: FastAPI (Python), Motor (Async MongoDB)
- **Database**: MongoDB Atlas / Local
- **Auth**: JWT with Mobile Number as Primary ID

## Project Structure

```
course-better/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── auth.py              # JWT authentication
│   ├── schemas/             # Pydantic models
│   └── routes/              # API routes
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts
│   │   ├── services/        # API services
│   │   └── styles/          # Global styles
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd course-better/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run at `http://localhost:8000`

### Frontend Setup

```bash
cd course-better/frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`

## Design System

- **Typography**: Playfair Display (headings), Outfit (body)
- **Colors**:
  - Deep Charcoal (#1A1A1A)
  - Warm Gold (#D4AF37)
  - Soft Cream (#F5F5DC)

## Features

### User Features
- Mobile number authentication
- Browse courses and products
- Add to cart and checkout
- Order history
- User profile management

### Admin Features
- Dashboard with statistics
- Course management (add/edit/delete)
- Product management (add/edit/delete)
- Category management
- Order management

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Courses
- `GET /courses` - List courses
- `POST /courses` - Create course (admin)
- `PUT /courses/{id}` - Update course (admin)
- `DELETE /courses/{id}` - Delete course (admin)

### Products
- `GET /products` - List products
- `POST /products` - Create product (admin)
- `PUT /products/{id}` - Update product (admin)
- `DELETE /products/{id}` - Delete product (admin)

### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category (admin)
- `PUT /categories/{id}` - Update category (admin)
- `DELETE /categories/{id}` - Delete category (admin)

### Orders
- `GET /orders` - Get user's orders
- `POST /orders` - Create order
- `GET /orders/all` - Get all orders (admin)
