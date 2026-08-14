import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartSlideOver from './components/layout/CartSlideOver';
import AuthModal from './components/auth/AuthModal';
import HomeView from './components/home/HomeView';
import ColeccionesRoute from './components/routes/ColeccionesRoute';
import EmpresasRoute from './components/routes/EmpresasRoute';
import EventosRoute from './components/routes/EventosRoute';
import CatalogView from './components/catalog/CatalogView';
import CustomizerView from './components/customizer/CustomizerView';
import CheckoutView from './components/checkout/CheckoutView';
import OrderTrackingView from './components/tracking/OrderTrackingView';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerProfileView from './components/profile/CustomerProfileView';
import FloatingSocials from './components/common/FloatingSocials';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function App() {
  const { currentView, navigateTo, toasts, removeToast, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  // URL Hash Synchronizer for dedicated /admin subpage support (#admin)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin' || hash === 'taller') {
        navigateTo('admin');
      } else if (hash === 'colecciones') {
        navigateTo('colecciones');
      } else if (hash === 'empresas' || hash === 'b2b') {
        navigateTo('empresas');
      } else if (hash === 'eventos') {
        navigateTo('eventos');
      } else if (hash === 'customizer' || hash === 'personalizar') {
        navigateTo('customizer');
      } else if (hash === 'catalog' || hash === 'catalogo') {
        navigateTo('catalog');
      } else if (hash === 'checkout') {
        navigateTo('checkout');
      } else if (hash === 'tracking' || hash === 'rastreo') {
        navigateTo('tracking');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigateTo]);

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
        {currentView === 'profile' && <CustomerProfileView />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartSlideOver />

      {/* Floating WhatsApp and Social Channels */}
      {currentView !== 'admin' && <FloatingSocials />}

      {/* Authentication Modal with RBAC Role Switchers */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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
