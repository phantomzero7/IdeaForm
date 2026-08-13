import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import IdeaFormLogo from '../common/IdeaFormLogo';
import { Lock, Mail, User, ShieldCheck, Wrench, Building2, UserCheck, X, ArrowRight, CheckCircle2 } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp, showToast } = useApp();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [accountType, setAccountType] = useState('CUSTOMER'); // 'CUSTOMER' | 'B2B_CLIENT'
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const success = await signIn(email, password);
        if (success) {
          onClose();
        }
      } else {
        const success = await signUp(email, password, {
          firstName,
          lastName,
          companyName: accountType === 'B2B_CLIENT' ? companyName : null,
          role: accountType
        });
        if (success) {
          onClose();
        }
      }
    } catch (err) {
      showToast(err.message || 'Error en autenticación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick One-Click Demo Logins for Fast Testing
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setIsSubmitting(true);
    await signIn(demoEmail, demoPassword);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <IdeaFormLogo size="small" showTagline={false} />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'login' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: '700',
              color: mode === 'login' ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'transparent',
              border: 'none',
              borderBottom: mode === 'register' ? '3px solid var(--color-primary)' : '3px solid transparent',
              fontWeight: '700',
              color: mode === 'register' ? 'var(--color-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {mode === 'register' && (
            <>
              {/* Account Type Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  TIPO DE CUENTA
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAccountType('CUSTOMER')}
                    style={{
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: accountType === 'CUSTOMER' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                      background: accountType === 'CUSTOMER' ? 'rgba(0, 130, 138, 0.08)' : '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    👤 Cliente Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('B2B_CLIENT')}
                    style={{
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: accountType === 'B2B_CLIENT' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                      background: accountType === 'B2B_CLIENT' ? 'rgba(0, 130, 138, 0.08)' : '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🏢 Cuenta Empresa B2B
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Apellidos</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {accountType === 'B2B_CLIENT' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Razón Social / Empresa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Innovación Tech S.A. de C.V."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontWeight: '700' }}
          >
            {isSubmitting
              ? 'Validando credenciales...'
              : mode === 'login'
              ? 'Entrar a mi Cuenta'
              : 'Registrar Cuenta'}
          </button>
        </form>

        {/* Quick Demo Logins for Fast Role Testing */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '0.75rem' }}>
            ⚡ ACCESOS RÁPIDOS DE PRUEBA POR ROL (RBAC)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => handleQuickLogin('admin@ideaform.mx', 'admin123')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #0f172a',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              👑 Administrador (Dueño)
            </button>

            <button
              onClick={() => handleQuickLogin('operador@ideaform.mx', 'operador123')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🛠️ Operador Taller 3D
            </button>

            <button
              onClick={() => handleQuickLogin('compras@innovacion.mx', 'empresa123')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🏢 Cliente B2B (Empresa)
            </button>

            <button
              onClick={() => handleQuickLogin('sofia@cliente.com', 'cliente123')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              👤 Cliente B2C
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
