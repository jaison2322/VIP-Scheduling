import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import {
  LayoutDashboard, Calendar, ScanLine, Users, Settings,
} from 'lucide-react';

// Screens
import SplashScreen from './routes/SplashScreen';
import LoginScreen from './routes/LoginScreen';
import DashboardScreen from './routes/DashboardScreen';
import ScanInvitationScreen from './routes/ScanInvitationScreen';
import AIProcessingScreen from './routes/AIProcessingScreen';
import ExtractedDetailsScreen from './routes/ExtractedDetailsScreen';
import ConfirmIgnoreScreen from './routes/ConfirmIgnoreScreen';
import UpcomingInvitationsScreen from './routes/UpcomingInvitationsScreen';
import CalendarScreen from './routes/CalendarScreen';
import EventDetailScreen from './routes/EventDetailScreen';
import PersonProfileScreen from './routes/PersonProfileScreen';
import PastFamilyFunctionsScreen from './routes/PastFamilyFunctionsScreen';
import PastEventDetailScreen from './routes/PastEventDetailScreen';
import GiftHistoryScreen from './routes/GiftHistoryScreen';
import AddEditEventScreen from './routes/AddEditEventScreen';
import AddInvitationScreen from './routes/AddInvitationScreen';
import ReminderCenterScreen from './routes/ReminderCenterScreen';
import ScheduleConflictScreen from './routes/ScheduleConflictScreen';
import PrivilegedUsersScreen from './routes/PrivilegedUsersScreen';
import PermissionManagementScreen from './routes/PermissionManagementScreen';
import NotificationsScreen from './routes/NotificationsScreen';
import ActivityHistoryScreen from './routes/ActivityHistoryScreen';
import SettingsScreen from './routes/SettingsScreen';
import PeopleListScreen from './routes/PeopleListScreen';

import { realtimeService } from './services/realtimeService';

// ─── Protected Route ────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Bottom Navigation ──────────────────────────────────────────────────────
function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getUnreadCount } = useAppStore();

  // Pages that should NOT show bottom nav
  const hideNavPages = [
    '/', '/login', '/ai-processing', '/extracted-details', '/confirm-ignore', '/add-invitation',
  ];

  // Also hide on detail pages
  const isDetailPage = location.pathname.startsWith('/event/') ||
    location.pathname.startsWith('/person/') ||
    location.pathname.startsWith('/past-event/') ||
    location.pathname.startsWith('/permissions/') ||
    location.pathname === '/notifications' ||
    location.pathname === '/activity' ||
    location.pathname === '/privileged-users' ||
    location.pathname === '/reminders' ||
    location.pathname === '/conflicts' ||
    location.pathname === '/add-event' ||
    location.pathname.startsWith('/edit-event/') ||
    location.pathname === '/add-invitation';

  if (hideNavPages.includes(location.pathname) || isDetailPage) return null;

  const unread = getUnreadCount();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <div className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
        <LayoutDashboard size={22} />
        <span className="nav-item-label">Home</span>
      </div>

      <div className={`nav-item ${isActive('/upcoming') ? 'active' : ''}`} onClick={() => navigate('/upcoming')}>
        <Calendar size={22} />
        <span className="nav-item-label">Events</span>
        {unread > 0 && <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>}
      </div>

      <div className={`nav-scan-btn ${isActive('/scan') ? 'active' : ''}`} onClick={() => navigate('/scan')}>
        <ScanLine size={24} />
      </div>

      <div className={`nav-item ${isActive('/people') ? 'active' : ''}`} onClick={() => navigate('/people')}>
        <Users size={22} />
        <span className="nav-item-label">People</span>
      </div>

      <div className={`nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}>
        <Settings size={22} />
        <span className="nav-item-label">More</span>
      </div>
    </nav>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { syncWithSupabase } = useAppStore();

  useEffect(() => {
    syncWithSupabase();
    const unsubscribe = realtimeService.subscribeAll();
    return () => {
      unsubscribe();
    };
  }, [syncWithSupabase]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Public */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />

          {/* Protected — Core Flow */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanInvitationScreen /></ProtectedRoute>} />
          <Route path="/ai-processing" element={<ProtectedRoute><AIProcessingScreen /></ProtectedRoute>} />
          <Route path="/extracted-details" element={<ProtectedRoute><ExtractedDetailsScreen /></ProtectedRoute>} />
          <Route path="/confirm-ignore" element={<ProtectedRoute><ConfirmIgnoreScreen /></ProtectedRoute>} />

          {/* Protected — Event & People */}
          <Route path="/upcoming" element={<ProtectedRoute><UpcomingInvitationsScreen /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarScreen /></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><EventDetailScreen /></ProtectedRoute>} />
          <Route path="/person/:id" element={<ProtectedRoute><PersonProfileScreen /></ProtectedRoute>} />
          <Route path="/people" element={<ProtectedRoute><PeopleListScreen /></ProtectedRoute>} />

          {/* Protected — Past Events & Gifts */}
          <Route path="/past-events" element={<ProtectedRoute><PastFamilyFunctionsScreen /></ProtectedRoute>} />
          <Route path="/past-event/:id" element={<ProtectedRoute><PastEventDetailScreen /></ProtectedRoute>} />
          <Route path="/gifts" element={<ProtectedRoute><GiftHistoryScreen /></ProtectedRoute>} />
          <Route path="/add-event" element={<ProtectedRoute><AddEditEventScreen /></ProtectedRoute>} />
          <Route path="/edit-event/:id" element={<ProtectedRoute><AddEditEventScreen /></ProtectedRoute>} />
          <Route path="/add-invitation" element={<ProtectedRoute><AddInvitationScreen /></ProtectedRoute>} />

          {/* Protected — Management */}
          <Route path="/conflicts" element={<ProtectedRoute><ScheduleConflictScreen /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><ReminderCenterScreen /></ProtectedRoute>} />
          <Route path="/privileged-users" element={<ProtectedRoute><PrivilegedUsersScreen /></ProtectedRoute>} />
          <Route path="/permissions/:id" element={<ProtectedRoute><PermissionManagementScreen /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityHistoryScreen /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}
