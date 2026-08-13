import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartSlideOver from './components/layout/CartSlideOver';
import HomeView from './components/home/HomeView';
import ColeccionesRoute from './components/routes/ColeccionesRoute';
import EmpresasRoute from './components/routes/EmpresasRoute';
import EventosRoute from './components/routes/EventosRoute';
import CatalogView from './components/catalog/CatalogView';
import CustomizerView from './components/customizer/CustomizerView';
import CheckoutView from './components/checkout/CheckoutView';
import OrderTrackingView from './components/tracking/OrderTrackingView';
import AdminDashboard from './components/admin/AdminDashboard';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function App() {
  const { currentView, toasts, removeToast } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Global Header */}
      <Header />

      {/* Main Dynamic View Content */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && <HomeView />}
        {currentView === 'colecciones' && <ColeccionesRoute />}
        {currentView === 'empresas' && <EmpresasRoute />}
        {currentView === 'eventos' && <EventosRoute />}
        {currentView === 'catalog' && <CatalogView />}
        {currentView === 'customizer' && <CustomizerView />}
        {currentView === 'b2b' && <EmpresasRoute />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'tracking' && <OrderTrackingView />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartSlideOver />

      {/* Toast Notifications Overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#f43f5e" />}
            {toast.type === 'info' && <Info size={18} color="#00e5ff" />}
            <span style={{ fontSize: '0.88rem', fontWeight: '500', flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
