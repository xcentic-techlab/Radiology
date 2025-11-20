# Radiology Portal - Radiology & Hospital Management System

A modern, production-ready React frontend for managing hospital operations, radiology reports, and patient records. Built with React (Vite), TypeScript, TailwindCSS, and shadcn/ui components.

## 🚀 Features

- **Multi-Role Authentication**: JWT-based auth with role-based access control
  - Super Admin / Admin
  - Reception Staff
  - Department Users (Radiologists, Technicians)
  - Patients

- **Admin Panel**
  - Dashboard with key metrics
  - User management
  - Department management
  - Payment tracking

- **Reception Panel**
  - Patient registration
  - Report creation and scheduling
  - Quick dashboard stats

- **Department Panel**
  - Case management
  - Report upload (PDF)
  - Findings and impression recording
  - Status workflow (created → in_progress → report_uploaded → reviewed → approved)

- **Patient Portal**
  - View all reports
  - Download PDF reports
  - Track report status
  - View findings and impressions

- **Real-time Features**
  - Socket.io integration for live updates
  - Notification system with unread count
  - Room-based broadcasts (admin, department, patient, user-specific)

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand (auth + notifications)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **API**: Axios with interceptors
- **Real-time**: Socket.io Client
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your backend URLs
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── api/                    # API service layer
│   ├── axios.ts           # Axios instance with interceptors
│   ├── auth.service.ts    # Authentication API
│   ├── users.service.ts   # Users API
│   ├── departments.service.ts
│   ├── patients.service.ts
│   ├── reports.service.ts
│   └── payments.service.ts
│
├── components/
│   ├── auth/              # Auth components (ProtectedRoute, RoleGuard)
│   ├── dialogs/           # Reusable dialog components
│   ├── layout/            # Layout components (Sidebar, Topbar, DashboardLayout)
│   └── ui/                # shadcn/ui components + custom UI
│
├── hooks/
│   ├── useSocket.ts       # Socket.io connection hook
│   ├── use-mobile.tsx     # Mobile detection
│   └── use-toast.ts       # Toast notifications
│
├── pages/
│   ├── Login.tsx          # Login page
│   ├── admin/             # Admin panel pages
│   ├── reception/         # Reception panel pages
│   ├── department/        # Department panel pages
│   ├── patient/           # Patient portal pages
│   └── NotFound.tsx       # 404 page
│
├── store/
│   ├── authStore.ts       # Zustand auth store
│   └── notificationStore.ts  # Zustand notification store
│
├── utils/
│   └── statusConfig.ts    # Status color mappings and labels
│
├── App.tsx                # Main app with routing
├── main.tsx              # App entry point
└── index.css             # Global styles + design system
```

## 🔐 Authentication Flow

1. **Login**: POST `/api/auth/login` with email and password
2. **Token Storage**: JWT stored in Zustand + localStorage
3. **Axios Interceptor**: Automatically adds `Authorization: Bearer <token>` to requests
4. **Auto-Logout**: 401 responses trigger logout and redirect to login
5. **Protected Routes**: `ProtectedRoute` component checks authentication
6. **Role Guards**: `RoleGuard` component enforces role-based access

## 📡 Socket.io Integration

### Connection Setup
- Connects on login with JWT token authentication
- Auto-reconnects on disconnect

### Room Joining
Based on user role:
- **Admin**: `admin_room`
- **Department User**: `department_<departmentId>`
- **Patient**: `patient_<userId>`
- **All Users**: `user_<userId>` (personal notifications)

### Handled Events
- `new_report`: New case created
- `report_uploaded`: Report PDF uploaded
- `status_changed`: Case status updated
- `notification`: General notifications

### Emitting Events
Use socket instance from backend to emit:
```javascript
io.to('admin_room').emit('new_report', reportData);
io.to(`department_${deptId}`).emit('report_uploaded', reportData);
io.to(`user_${userId}`).emit('notification', notificationData);
```

## 🎨 Design System

The app uses a professional hospital-themed design system:

- **Primary**: Medical blue (#0066CC) - Trust and professionalism
- **Success**: Medical green - Positive outcomes
- **Warning**: Amber - Attention items
- **Accent**: Cyan - Interactive elements
- **Background**: Clean white/light gray
- **Sidebar**: Dark blue-gray - Professional contrast

All colors are defined as HSL in `src/index.css` and used via semantic tokens.

## 🔄 API Endpoints Used

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Register patient

### Reports
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports` - Create report
- `POST /api/reports/:id/upload` - Upload report file
- `PATCH /api/reports/:id/status` - Update status

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/report/:reportId` - Get payments for report
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id/status` - Update payment status

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ENV=development
```

### Backend Requirements
- CORS enabled for frontend origin
- JWT authentication
- Socket.io with token authentication
- Multipart/form-data support for file uploads

## 🎭 Role-Based Features

| Feature | Super Admin | Admin | Reception | Department User | Patient |
|---------|-------------|-------|-----------|----------------|---------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Departments | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Payments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Register Patients | ❌ | ❌ | ✅ | ❌ | ❌ |
| Create Reports | ❌ | ❌ | ✅ | ❌ | ❌ |
| Manage Cases | ❌ | ❌ | ❌ | ✅ | ❌ |
| Upload Reports | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Own Reports | ❌ | ❌ | ❌ | ❌ | ✅ |

## 📝 Development Notes

### Adding New Routes
1. Create page component in appropriate `pages/` subdirectory
2. Add route in `App.tsx` with proper protection and role guard
3. Update sidebar menu in `components/layout/Sidebar.tsx` if needed

### Adding New API Service
1. Create service file in `api/` directory
2. Define TypeScript interfaces
3. Import and use axios instance from `api/axios.ts`
4. Handle errors with try-catch and toast notifications

### Customizing Design
- Update CSS variables in `src/index.css`
- Modify TailwindCSS config in `tailwind.config.ts`
- Customize shadcn components in `src/components/ui/`

## 🐛 Troubleshooting

### Socket Connection Issues
- Verify `VITE_SOCKET_URL` is correct
- Check backend CORS settings
- Ensure JWT token is valid

### API Call Failures
- Check `VITE_API_URL` configuration
- Verify backend is running
- Check browser console for CORS errors

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Verify all imports are correct

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, contact the development team.
