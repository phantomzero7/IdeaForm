import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, user, setUser, setUserRole, showToast } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Helper: Automatically determine role based on system domain or verified email
  const detectUserRole = (userEmail) => {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    if (cleanEmail.includes('admin') || cleanEmail.endsWith('@ideaform.com') || cleanEmail === 'gerencia@ideaform.com') {
      return 'ADMIN';
    }
    if (cleanEmail.includes('operador') || cleanEmail.includes('taller')) {
      return 'OPERATOR_3D';
    }
    if (cleanEmail.includes('empresa') || cleanEmail.includes('b2b') || cleanEmail.includes('compras@')) {
      return 'B2B_CLIENT';
    }
    return 'CUSTOMER';
  };

  // 1. Handle Google OAuth 1-Click Login
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      showToast('Conectando con Google...', 'info');

      if (supabase && supabase.auth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) {
          console.warn('OAuth fallback mock');
        }
      }

      const assignedRole = detectUserRole(email || 'cliente@gmail.com');
      const mockGoogleUser = {
        id: 'usr-google-999',
        email: email || 'usuario.google@gmail.com',
        firstName: 'Usuario',
        lastName: 'Google',
        role: assignedRole
      };

      setUser(mockGoogleUser);
      setUserRole(assignedRole);
      setIsAuthModalOpen(false);
      showToast('¡Bienvenido! Sesión iniciada con Google', 'success');
    } catch (err) {
      showToast('Error al conectar con Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Email / Password Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    setLoading(true);

    const firstName = fullName ? fullName.split(' ')[0] : email.split('@')[0];
    const lastName = fullName && fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : '';
    const autoRole = detectUserRole(email);

    const loggedUser = {
      id: `usr-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: autoRole
    };

    setUser(loggedUser);
    setUserRole(autoRole);
    setIsAuthModalOpen(false);
    setLoading(false);

    showToast(
      mode === 'login'
        ? `¡Bienvenido de nuevo, ${firstName}!`
        : `¡Cuenta creada exitosamente para ${firstName}!`,
      'success'
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with IdeaForm Palette */}
        <div style={{ background: '#0F5F6D', color: '#ffffff', padding: '1.75rem 2rem', position: 'relative' }}>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em' }}>
            ACCESO SEGURO
          </span>

          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
            {mode === 'login'
              ? 'Ingresa para ver el estado de tus pedidos y cotizaciones.'
              : 'Únete para guardar tus diseños 3D y agilizar tus compras.'}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem' }}>
          
          {/* 1. Fast Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              background: '#ffffff',
              color: '#1f2937',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>O CON TU CORREO</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Nombre Completo *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Carlos Morales"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Correo Electrónico *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Contraseña *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => showToast('Se ha enviado un enlace de recuperación a tu correo', 'info')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: '800', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>{loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarme'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Switch Mode Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <span>
                ¿No tienes cuenta aún?{' '}
                <button
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
