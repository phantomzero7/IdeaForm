import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import IdeaFormLogo from '../common/IdeaFormLogo';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, setUserRole, navigateTo, showToast } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  // 1. Google 1-Click Authentication
  const handleGoogleAuth = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const googleUser = {
      id: `usr-google-${Date.now()}`,
      email: email || 'carlos.fregoso@gmail.com',
      firstName: 'Carlos',
      lastName: 'Fregoso',
      provider: 'google',
      phone: '55 1234 5678',
      role: 'CUSTOMER'
    };

    // Save to App State & LocalStorage
    setUser(googleUser);
    setUserRole('CUSTOMER');
    localStorage.setItem('ideaform_user', JSON.stringify(googleUser));
    localStorage.setItem('ideaform_user_role', 'CUSTOMER');

    setIsAuthModalOpen(false);
    showToast('¡Bienvenido! Sesión iniciada con Google ✨', 'success');
    navigateTo('profile');
  };

  // 2. Email / Password Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    setIsSubmitting(true);

    const firstName = fullName ? fullName.split(' ')[0] : email.split('@')[0];
    const lastName = fullName && fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : '';

    const loggedUser = {
      id: `usr-${Date.now()}`,
      email,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName,
      phone: '55 9876 5432',
      role: 'CUSTOMER'
    };

    setUser(loggedUser);
    setUserRole('CUSTOMER');
    localStorage.setItem('ideaform_user', JSON.stringify(loggedUser));
    localStorage.setItem('ideaform_user_role', 'CUSTOMER');

    setIsAuthModalOpen(false);
    setIsSubmitting(false);

    showToast(
      mode === 'login'
        ? `¡Bienvenido de nuevo, ${loggedUser.firstName}!`
        : `¡Cuenta creada exitosamente para ${loggedUser.firstName}!`,
      'success'
    );
    navigateTo('profile');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-light)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Cerrar modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
        >
          <X size={18} />
        </button>

        {/* Clean Header with Official Logo & High-Contrast Titles */}
        <div style={{ padding: '2.5rem 2rem 1.25rem 2rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <IdeaFormLogo size="medium" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear tu Cuenta'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.4rem', margin: 0, lineHeight: '1.4' }}>
            {mode === 'login'
              ? 'Accede a tus pedidos 3D, envíos y cotizaciones'
              : 'Regístrate para guardar tus piezas y personalizar en 3D'}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem 2rem 2.25rem 2rem' }}>
          
          {/* 1. Google 1-Click Fast Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: '700',
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              marginBottom: '1.25rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.04em' }}>
              O CON CORREO
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Nombre Completo *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Carlos Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Correo Electrónico *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155' }}>
                  Contraseña *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => showToast('Enlace de recuperación enviado a tu correo', 'info')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                fontWeight: '800',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem'
              }}
            >
              <span>{isSubmitting ? 'Verificando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Switch Mode Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            {mode === 'login' ? (
              <span>
                ¿No tienes cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                >
                  Regístrate gratis
                </button>
              </span>
            ) : (
              <span>
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                >
                  Inicia sesión
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
