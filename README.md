# DesiRestro - Multi-tenant Restaurant POS System

A modern, feature-rich Point of Sale system for restaurants with multi-tenant support, real-time order management, and comprehensive reporting.

![React](https://img.shields.io/badge/React-19.2.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.19-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Features

### Core Functionality
- ✅ **Multi-tenant Architecture** - Isolated data per restaurant
- ✅ **Role-based Access Control** - Admin, Captain, Kitchen, Cashier roles
- ✅ **Real-time Order Management** - Live KOT updates
- ✅ **Table Management** - Track occupancy and party status
- ✅ **Inventory Tracking** - Stock management with low-stock alerts
- ✅ **Comprehensive Reporting** - Sales, revenue, and analytics
- ✅ **Staff Management** - Attendance, leaves, and performance tracking

### User Roles

#### 🔑 Admin/Owner
- Dashboard with sales analytics
- Menu management (categories & items)
- Table configuration
- Staff management
- Inventory control
- Reports and insights

#### 👨‍🍳 Captain
- Table status overview
- Create and manage parties
- Take orders
- View ready KOTs for serving
- Real-time table updates

#### 🍳 Kitchen
- View active KOTs
- Mark orders as ready
- Audio notifications for new orders
- Order prioritization

#### 💰 Cashier
- View occupied tables
- Generate bills with GST
- Multiple payment methods
- Print receipts
- Settlement tracking

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API server running (default: http://localhost:8080)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd desirestro-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_ENV=development
```

4. **Start development server**
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
desirestro-frontend/
├── public/                 # Static assets
│   ├── kot-beep.mp3       # Audio notification
│   └── index.html
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common UI components
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── Toast.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ConfirmDialog.js
│   │   ├── captain/       # Captain-specific components
│   │   │   ├── TableGrid.jsx
│   │   │   ├── PartyModal.jsx
│   │   │   ├── OrderModal.jsx
│   │   │   └── ReadyKOTPanel.jsx
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── context/           # React Context
│   │   └── AuthContext.js
│   ├── hooks/             # Custom hooks
│   │   └── useConfirm.js
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   │   ├── SalesDashboard.js
│   │   │   ├── MenuManagement.js
│   │   │   ├── TableManagement.js
│   │   │   ├── StaffManagement.js
│   │   │   └── InventoryDashboard.js
│   │   ├── AdminDashboard.js
│   │   ├── CaptainHome.js
│   │   ├── KitchenKOT.js
│   │   ├── CashierBilling.js
│   │   └── Login.js
│   ├── services/          # API services
│   │   └── api.js
│   ├── utils/             # Utility functions
│   │   ├── constants.js   # App constants
│   │   └── helpers.js     # Helper functions
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── COMPREHENSIVE_REVIEW_AND_ENHANCEMENT_PLAN.md
├── IMPLEMENTATION_GUIDE.md
└── package.json
```

---

## 🔐 Authentication

### Default Login Credentials

The system uses JWT-based authentication. Contact your administrator for credentials.

**Example roles:**
- Admin: Full system access
- Captain: Table and order management
- Kitchen: KOT management
- Cashier: Billing operations

### Registration

New restaurants can register through the registration form:
1. Navigate to login page
2. Click "Register Restaurant"
3. Fill in restaurant and owner details
4. System creates admin account automatically

---

## 🛠️ Technology Stack

### Frontend
- **React 19.2.3** - UI framework
- **React Router 6** - Navigation
- **Tailwind CSS 3.4** - Styling
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **JWT Decode** - Token handling

### Key Features
- JWT authentication with refresh tokens
- HTTP-only cookies for security
- Responsive design
- Real-time updates via polling
- Audio notifications
- Print functionality

---

## 📊 API Integration

The frontend communicates with a REST API backend. Key endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Restaurant registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Menu Management
- `GET /api/menu/categories` - Get categories
- `GET /api/menu/items` - Get menu items
- `POST /api/menu/items` - Create item
- `PUT /api/menu/items/:id` - Update item
- `DELETE /api/menu/items/:id` - Delete item

### Orders & KOT
- `GET /api/kot/active` - Get active KOTs
- `GET /api/kot/ready` - Get ready KOTs
- `POST /api/kot` - Create KOT
- `PATCH /api/kot/:id/ready` - Mark as ready

### Billing
- `GET /api/bills/pending` - Get pending bills
- `POST /api/bills/generate/:partyId` - Generate bill
- `POST /api/bills/:id/settle` - Settle bill

See `src/services/api.js` for complete API documentation.

---

## 🎨 Customization

### Theming

Modify `tailwind.config.js` to customize colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#f59e0b',    // Amber
        secondary: '#ea580c',  // Orange
      }
    }
  }
}
```

### Constants

Update `src/utils/constants.js` for:
- Tax rates
- Polling intervals
- Payment methods
- Validation rules

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

---

## 🏗️ Building for Production

```bash
# Create production build
npm run build

# The build folder will contain optimized files
# Deploy the contents to your web server
```

### Environment Variables for Production

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WS_URL=wss://api.yourdomain.com/ws
REACT_APP_ENV=production
```

---

## 📈 Performance Optimization

### Implemented
- Code splitting by route
- Lazy loading of components
- Optimized images
- Minified CSS and JS
- Gzip compression

### Recommended
- CDN for static assets
- Service worker for offline support
- Image optimization
- Bundle size analysis

---

## 🔒 Security

### Implemented
- JWT authentication
- HTTP-only cookies for refresh tokens
- CORS configuration
- Input validation
- Role-based access control

### Recommended
- Input sanitization with DOMPurify
- CSRF protection
- Rate limiting
- Security headers
- Regular security audits

---

## 🐛 Troubleshooting

### Common Issues

**Issue: API calls failing**
- Check if backend server is running
- Verify REACT_APP_API_URL in .env
- Check browser console for CORS errors

**Issue: Login not working**
- Clear browser cache and cookies
- Check network tab for API responses
- Verify credentials with backend team

**Issue: Real-time updates not working**
- Check polling intervals in constants.js
- Verify API endpoints are accessible
- Consider implementing WebSocket

**Issue: Build fails**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check for dependency conflicts

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint and Prettier
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

---

## 📚 Documentation

- **[Comprehensive Review & Enhancement Plan](COMPREHENSIVE_REVIEW_AND_ENHANCEMENT_PLAN.md)** - Detailed analysis and roadmap
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation instructions

---

## 🗺️ Roadmap

### Phase 1: Core Enhancements (Current)
- [x] Error boundary implementation
- [x] Toast notification system
- [x] Loading states
- [x] Utility functions and constants
- [ ] Input sanitization
- [ ] WebSocket integration

### Phase 2: Feature Additions
- [ ] Split bill functionality
- [ ] Tax configuration
- [ ] Order modifications
- [ ] Advanced reporting
- [ ] Audit logging

### Phase 3: Advanced Features
- [ ] Customer management
- [ ] Reservation system
- [ ] Recipe management
- [ ] Multi-language support
- [ ] Dark mode

### Phase 4: Mobile & Integration
- [ ] Mobile app (React Native)
- [ ] QR code ordering
- [ ] Payment gateway integration
- [ ] Third-party delivery integration

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

- **Lead Developer** - Architecture & Implementation
- **Backend Team** - API Development
- **UI/UX Designer** - Interface Design
- **QA Team** - Testing & Quality Assurance

---

## 📞 Support

For support, email support@desirestro.com or join our Slack channel.

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and testers

---

## 🐛 Missing / Newly-added client capabilities (quick)

- Client helpers added to src/services/api.js:
  - setAuthToken(token), clearAuthToken()
  - requestWithRetry(fn) for transient network retries
  - Reservations endpoints: GET/POST/PUT/cancel
  - Split-bill endpoints: create/list/get splits
  - Tax settings: get/update per restaurant
  - createWebSocket(path) factory (uses REACT_APP_WS_URL and token)
  - downloadBlob(blob, filename) helper

## Short developer checklist — immediate frontend tasks

1. Install required client libs:
   - npm install date-fns react-hot-toast dompurify react-to-print

2. Implement/Enhance pages (use the added API helpers):
   - MenuItemForm.js — add spice level, dietary flags, HSN, prep time.
   - SplitBillModal.js — UI to create equal/custom/item splits, call splitBill API.
   - Reservation pages — ReservationsList, ReservationForm (use Reservations endpoints).
   - Replace alert() with toast (react-hot-toast) and use DOMPurify before sending/rendering user input.
   - Wire real-time KOT/billing updates using createWebSocket('/kot') and reconnect logic.

3. Testing:
   - Verify token refresh flow (API interceptor already present).
   - Test split-bill flows and reservation CRUD.
   - Run frontend build after installing dependencies.
}

---

**Built with ❤️ for the restaurant industry**

*Last Updated: April 1, 2026*
