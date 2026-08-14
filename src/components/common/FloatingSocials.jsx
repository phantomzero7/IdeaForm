import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  X,
  Sparkles,
  Send,
  ArrowRight,
  Package,
  FileText,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  RotateCcw,
  ExternalLink,
  Bot,
  AlertCircle
} from 'lucide-react';
import IdeaFormLogo from './IdeaFormLogo';

const INSTAGRAM_URL = 'https://www.instagram.com/ideaform.mx/';
const FACEBOOK_URL = 'https://www.facebook.com/ideaform3d';
const BOT_AVATAR_SRC = '/ideaform-bot.png';

// Helper for cleaning and normalizing strings (removes accents, lowercase, removes noise)
const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s]/gi, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
};

const FloatingSocials = () => {
  const {
    navigateTo,
    productionOrders,
    botIntents,
    botSettings
  } = useApp();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showGreetingTooltip, setShowGreetingTooltip] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: botSettings?.welcomeGreeting || '¡Hola! 👋 Soy tu **Asistente IdeaForm 3D**. Estoy conectado con el taller en vivo. ¿En qué proyecto o duda te puedo apoyar hoy?',
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Active non-archived intents for quick chips
  const activeIntents = useMemo(() => {
    return (botIntents || []).filter((i) => i.isActive !== false && !i.isArchived);
  }, [botIntents]);

  // Auto-hide the floating greeting bubble after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreetingTooltip(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      setShowGreetingTooltip(false);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen]);

  const handleSelectIntent = (intentObj) => {
    if (!intentObj) return;

    const userMsg = {
      sender: 'user',
      text: intentObj.chipLabel || intentObj.title,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        sender: 'bot',
        text: intentObj.response,
        actionLabel: intentObj.actionLabel,
        actionRoute: intentObj.actionRoute,
        actionType: intentObj.actionType,
        intent: intentObj.intent,
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const rawInput = inputText.trim();
    const cleanInput = normalizeText(rawInput);

    const userMsg = {
      sender: 'user',
      text: rawInput,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // 1. Order Tracking by Folio Detection
      if (cleanInput.includes('idf') || cleanInput.includes('ord') || cleanInput.includes('folio') || /\d{4,}/.test(cleanInput)) {
        const foundOrder = (productionOrders || []).find((o) => {
          const num = normalizeText(o.orderNumber || '');
          const id = normalizeText(o.id || '');
          return (num && cleanInput.includes(num)) || (id && cleanInput.includes(id));
        });

        if (foundOrder) {
          const statusMap = {
            QUEUED: '🟡 1. En Cola de Producción',
            SLICING: '🔵 2. Slicing / Preparando G-Code',
            PRINTING: '🔵 3. En Impresora 3D',
            QUALITY_CONTROL: '🟣 4. Control de Calidad',
            READY_TO_SHIP: '🟢 5. Listo para Envío'
          };

          setChatHistory((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: `🔎 ¡Encontré tu pedido **#${foundOrder.orderNumber}**!\n\n• **Producto:** ${foundOrder.productName}\n• **Estado:** ${statusMap[foundOrder.status] || foundOrder.status}\n• **Grabado Personalizado:** "${foundOrder.customText || 'N/A'}"\n• **Cliente:** ${foundOrder.customerName}\n• **Total:** $${foundOrder.total} MXN\n\n¿Deseas confirmar la fecha de entrega por WhatsApp?`,
              actionLabel: 'Confirmar con Asesor por WhatsApp',
              actionType: 'WHATSAPP',
              intent: `RASTREO_${foundOrder.orderNumber}`,
              time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          return;
        }
      }

      // 2. Keyword matching across active intents (Fuzzy matching & typo tolerance)
      let bestMatch = null;
      let highestScore = 0;

      for (const intent of activeIntents) {
        let score = 0;
        const keywords = intent.keywords || [];

        for (const kw of keywords) {
          const cleanKw = normalizeText(kw);
          if (cleanInput.includes(cleanKw)) {
            score += cleanKw.length > 4 ? 3 : 1;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = intent;
        }
      }

      if (bestMatch && highestScore > 0) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: bestMatch.response,
            actionLabel: bestMatch.actionLabel,
            actionRoute: bestMatch.actionRoute,
            actionType: bestMatch.actionType,
            intent: bestMatch.intent,
            time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      // 3. Fallback / Error Recovery Message (Tolerance for client mistakes)
      const fallbackMsg = botSettings?.fallbackMessage ||
        'No logré entender por completo tu mensaje, pero con gusto puedo ayudarte. ¿Te refieres a alguna de estas opciones o prefieres comunicarte directamente con nuestro taller por WhatsApp?';

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `🤖 ${fallbackMsg}\n\nPuedes seleccionar uno de los temas frecuentes aquí abajo o transferir tu consulta a nuestro taller.`,
          actionLabel: 'Transferir a WhatsApp con Asesor',
          actionType: 'WHATSAPP',
          intent: 'CONSULTA_GENERAL',
          time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 500);
  };

  const handleTransferToWhatsApp = (intent = 'GENERAL') => {
    const targetPhone = (botSettings?.whatsappNumber || '526121403409').replace(/\D/g, '');
    const userQueries = chatHistory
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join(' | ');

    const summaryText = `¡Hola IdeaForm Taller! 👋\n\nEstuve platicando con el Asistente Virtual en la web y requiero apoyo para:\n📌 Motivo: ${intent}\n💬 Mensajes: "${userQueries || 'Consulta general de impresión 3D'}"\n\n¿Me podrían asesorar por favor?`;

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <>
      {/* 1. RIGHT-SIDE STICKY FLOATING SOCIAL DOCK */}
      <aside
        aria-label="Canales de contacto y redes sociales"
        className="floating-socials-aside"
        style={{
          position: 'fixed',
          right: '1.25rem',
          bottom: '2rem',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        {/* Instagram Button */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Síguenos en Instagram @ideaform.mx"
          className="floating-social-icon"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(220, 39, 67, 0.4)',
            textDecoration: 'none',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        </a>

        {/* Facebook Button */}
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook Oficial IdeaForm"
          className="floating-social-icon"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#1877F2',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)',
            textDecoration: 'none',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>

        {/* Mascot Robot Chatbot Floating Button Container */}
        <div style={{ position: 'relative' }}>
          
          {/* Pop-in Greeting Tooltip Badge */}
          {showGreetingTooltip && !isChatOpen && (
            <div
              onClick={() => setIsChatOpen(true)}
              style={{
                position: 'absolute',
                right: '72px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#0F172A',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.75rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid #334155',
                animation: 'bounceIn 0.4s ease-out'
              }}
            >
              <span>💬 ¿Dudas o Cotización 3D?</span>
              <span style={{ color: '#00e5ff' }}>¡Pregúntame!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGreetingTooltip(false);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, marginLeft: '0.2rem' }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Robot Mascot Trigger Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Asistente Virtual Robot IdeaForm"
            className="floating-bot-btn"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0F172A 0%, #176B87 100%)',
              border: '2.5px solid #00e5ff',
              boxShadow: '0 8px 24px rgba(0, 229, 255, 0.35), 0 4px 12px rgba(15, 23, 42, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              padding: '2px',
              overflow: 'visible',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
          >
            {isChatOpen ? (
              <X size={30} color="#ffffff" />
            ) : (
              <img
                src={BOT_AVATAR_SRC}
                alt="IdeaForm Robot Mascot"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
            )}

            {/* Online green indicator badge */}
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2.5px solid #ffffff',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
              }}
            />
          </button>
        </div>
      </aside>

      {/* 2. CHATBOT ASSISTANT WINDOW */}
      {isChatOpen && (
        <div
          role="dialog"
          aria-label="Asistente Virtual IdeaForm 3D"
          className="card card-elevated floating-chat-card"
          style={{
            position: 'fixed',
            right: '1.25rem',
            bottom: '7.5rem',
            width: '370px',
            maxWidth: 'calc(100vw - 2.5rem)',
            height: '540px',
            maxHeight: 'calc(100vh - 9rem)',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s ease-out'
          }}
        >
          {/* Chatbot Header with Robot Mascot */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #176B87 100%)',
              color: '#ffffff',
              padding: '0.85rem 1.15rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid #00e5ff',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
                }}
              >
                <img
                  src={BOT_AVATAR_SRC}
                  alt="IdeaForm Robot"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{botSettings?.botName || 'IdeaForm Bot'}</span>
                  <span style={{ fontSize: '0.62rem', background: '#10b981', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', fontWeight: '800' }}>
                    EN VIVO
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Asistente & Taller 3D Inteligente
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              background: '#f8fafc',
              fontSize: '0.82rem'
            }}
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                {/* Bot / User Avatar */}
                {msg.sender === 'bot' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#0F172A',
                      border: '1px solid #00e5ff',
                      padding: '1px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={BOT_AVATAR_SRC}
                      alt="Robot Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '82%'
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: msg.sender === 'user' ? '#176B87' : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : '#0F172A',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      lineHeight: '1.45',
                      border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}

                    {/* Action Button */}
                    {msg.actionLabel && (
                      <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        {msg.actionType === 'NAVIGATE' && msg.actionRoute ? (
                          <button
                            onClick={() => {
                              navigateTo(msg.actionRoute);
                              setIsChatOpen(false);
                            }}
                            style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              cursor: 'pointer',
                              width: '100%',
                              justifyContent: 'center'
                            }}
                          >
                            <span>{msg.actionLabel}</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTransferToWhatsApp(msg.intent || 'GENERAL')}
                            style={{
                              background: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.4rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              width: '100%',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                            }}
                          >
                            <MessageCircle size={14} />
                            <span>{msg.actionLabel}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem', padding: '0 0.35rem' }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0F172A', padding: '1px' }}>
                  <img src={BOT_AVATAR_SRC} alt="Typing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span>IdeaForm Bot está escribiendo...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Guided Options Pills (Loaded dynamically from botIntents) */}
          <div style={{ background: '#ffffff', padding: '0.5rem 0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {activeIntents.map((intent) => (
              <button
                key={intent.id}
                onClick={() => handleSelectIntent(intent)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {intent.chipLabel || intent.title}
              </button>
            ))}

            <button
              onClick={() => handleTransferToWhatsApp('HABLAR_CON_ASESOR')}
              style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: '800',
                color: '#15803d',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              💬 WhatsApp
            </button>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '0.65rem 0.75rem',
              background: '#ffffff',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Escribe tu duda, folio o proyecto..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                background: inputText.trim() ? '#176B87' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'background 0.15s ease'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingSocials;
