import React, { useState, useRef, useEffect } from 'react';
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
  Bot,
  User,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import IdeaFormLogo from './IdeaFormLogo';

const WHATSAPP_TEST_NUMBER = '526121403409';
const INSTAGRAM_URL = 'https://www.instagram.com/ideaform.mx/';
const FACEBOOK_URL = 'https://www.facebook.com/ideaform3d';

const CHATBOT_KNOWLEDGE = {
  cotizacion: {
    title: '🎨 Cotizar Diseño o Producto 3D',
    response: '¡Con gusto te ayudamos a materializar tu idea! 🚀\n\nNuestros precios se calculan según los gramos de filamento y tiempo de impresión:\n• **Llaveros y Tags 3D:** desde $45 a $90 MXN\n• **Estaciones de Escritorio / Docks:** desde $180 a $290 MXN\n• **Lámparas Litofanía y Deco:** desde $280 a $450 MXN\n• **Proyectos Especiales / STL:** Cotización a la medida.\n\n¿Deseas enviar tus requerimientos o archivo a nuestro taller por WhatsApp?',
    actionLabel: 'Continuar por WhatsApp con Asesor',
    intent: 'COTIZACION'
  },
  rastreo: {
    title: '🚚 Rastrear Pedido de Taller',
    response: 'Para consultar el avance de tu pieza en el taller (En Cola, En Impresora 3D o Listo para Envío), puedes ingresar tu número de folio en nuestra sección de **Rastrear** o proporcionarnos tu folio aquí.',
    actionLabel: 'Ver Sección de Rastreo',
    actionRoute: 'tracking',
    intent: 'RASTREO'
  },
  empresas: {
    title: '🏢 Cotizaciones B2B & Mayoreo',
    response: '¡Manejamos paquetes mayoristas con descuentos escalonados y facturación CFDI 4.0!\n\n• **25 a 49 unidades:** 10% de descuento\n• **50 a 99 unidades:** 18% de descuento + 1 muestra física\n• **100 a 299 unidades:** 25% de descuento + Envío nacional GRATIS\n• **300+ unidades:** 33% de descuento con empaque corporativo.',
    actionLabel: 'Ir a Cotizador B2B',
    actionRoute: 'empresas',
    intent: 'B2B'
  },
  materiales: {
    title: '🧵 Materiales & Filamentos',
    response: 'Utilizamos polímeros termoplásticos de grado premium:\n• **PLA Silk (Seda):** Brillo metálico espectacular, ideal para llaveros y trofeos.\n• **PLA Mate:** Textura suave y colores sobrios para decoración.\n• **PETG Técnico:** Resistente al agua y rayos UV para uso rudo.\n\nTodos nuestros materiales son 100% biodegradables derivados del maíz y libres de toxinas.',
    actionLabel: 'Hablar con Ingeniero de Materiales',
    intent: 'MATERIALES'
  }
};

const FloatingSocials = () => {
  const { navigateTo, productionOrders } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: '¡Hola! 👋 Bienvenido a **IdeaForm 3D**. Soy tu asistente virtual de taller. ¿En qué podemos ayudarte hoy?',
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen]);

  const handleSelectOption = (key) => {
    const item = CHATBOT_KNOWLEDGE[key];
    if (!item) return;

    // User message
    const userMsg = {
      sender: 'user',
      text: item.title,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        sender: 'bot',
        text: item.response,
        actionLabel: item.actionLabel,
        actionRoute: item.actionRoute,
        intent: item.intent,
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, botMsg]);
    }, 450);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMsg = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();

      // Check for tracking number like IDF-XXXXX or ord-XXXX
      if (lower.includes('idf-') || lower.includes('ord-') || lower.includes('849')) {
        const foundOrder = productionOrders.find((o) =>
          o.orderNumber?.toLowerCase().includes(lower) || o.id?.toLowerCase().includes(lower)
        );

        let botReply = '';
        if (foundOrder) {
          botReply = `🔎 ¡Encontré tu pedido **#${foundOrder.orderNumber}** (${foundOrder.productName})!\n\n• **Estado actual:** ${foundOrder.status === 'PRINTING' ? '🔵 En Impresora 3D' : foundOrder.status === 'READY_TO_SHIP' ? '🟢 Listo para Envío' : '🟡 En Cola de Producción'}\n• **Cliente:** ${foundOrder.customerName}\n• **Texto Grabado:** "${foundOrder.customText || 'N/A'}"\n• **Total:** $${foundOrder.total} MXN\n\n¿Deseas recibir actualización fotográfica por WhatsApp?`;
        } else {
          botReply = `🔎 He buscado el folio "${userText}" pero aún no está registrado o fue generado fuera de línea. Puedes transferir esta consulta directamente a un operador por WhatsApp para localizarlo.`;
        }

        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: botReply,
            actionLabel: 'Confirmar con Asesor por WhatsApp',
            intent: 'RASTREO_DIRECTO',
            time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (lower.includes('precio') || lower.includes('cuanto') || lower.includes('costo') || lower.includes('cotiz')) {
        handleSelectOption('cotizacion');
      } else if (lower.includes('mayoreo') || lower.includes('empresa') || lower.includes('factura') || lower.includes('b2b')) {
        handleSelectOption('empresas');
      } else if (lower.includes('material') || lower.includes('filamento') || lower.includes('pla') || lower.includes('color')) {
        handleSelectOption('materiales');
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `Entendido: "${userText}". He recopilado tu mensaje. Para darte una solución personalizada y revisar tu diseño o dudas técnicas, ¿te gustaría continuar con nuestro taller por WhatsApp?`,
            actionLabel: 'Transferir Conversación a WhatsApp',
            intent: 'CUSTOM_INQUIRY',
            time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 550);
  };

  const handleTransferToWhatsApp = (intent = 'GENERAL') => {
    // Generate summarized transcript
    const userQueries = chatHistory
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join(' | ');

    const summaryText = `¡Hola IdeaForm Taller! 👋\n\nEstuve platicando con el Asistente Virtual en la web y requiero apoyo para:\n📌 Motivo: ${intent}\n💬 Mensajes: "${userQueries || 'Consulta general de impresión 3D'}"\n\n¿Me podrían asesorar por favor?`;

    const waUrl = `https://wa.me/${WHATSAPP_TEST_NUMBER}?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <>
      {/* 1. RIGHT-SIDE STICKY FLOATING SOCIAL DOCK */}
      <aside
        aria-label="Canales de contacto y redes sociales"
        style={{
          position: 'fixed',
          right: '1.25rem',
          bottom: '2rem',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        {/* Instagram Button */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Síguenos en Instagram @ideaform.mx"
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

        {/* Interactive Chatbot & WhatsApp Trigger Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Asistente Virtual & WhatsApp Taller"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #176B87 0%, #0F5F6D 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 6px 20px rgba(23, 107, 135, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          {isChatOpen ? <X size={26} /> : <Bot size={28} />}

          {/* Online green indicator badge */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #ffffff'
            }}
          />
        </button>
      </aside>

      {/* 2. CHATBOT ASSISTANT WINDOW */}
      {isChatOpen && (
        <div
          role="dialog"
          aria-label="Asistente Virtual IdeaForm 3D"
          className="card card-elevated"
          style={{
            position: 'fixed',
            right: '1.25rem',
            bottom: '7rem',
            width: '360px',
            maxWidth: 'calc(100vw - 2.5rem)',
            height: '520px',
            maxHeight: 'calc(100vh - 8.5rem)',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s ease-out'
          }}
        >
          {/* Chatbot Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #176B87 100%)',
              color: '#ffffff',
              padding: '0.9rem 1.15rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.45rem', borderRadius: '50%' }}>
                <Bot size={20} color="#00e5ff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>IdeaForm Assistant</span>
                  <span style={{ fontSize: '0.62rem', background: '#10b981', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)' }}>
                    AI 3D
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Taller de Manufactura en Línea
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
            >
              <X size={18} />
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
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.sender === 'user' ? '#176B87' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#0F172A',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    lineHeight: '1.45',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}

                  {/* Optional Action Button embedded in Bot Message */}
                  {msg.actionLabel && (
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      {msg.actionRoute ? (
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
                            justifyContent: 'center'
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
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                <Bot size={14} />
                <span>IdeaForm está escribiendo...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Guided Options Pills */}
          <div style={{ background: '#ffffff', padding: '0.5rem 0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            <button
              onClick={() => handleSelectOption('cotizacion')}
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
              🎨 Cotizar
            </button>

            <button
              onClick={() => handleSelectOption('rastreo')}
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
              🚚 Rastrear
            </button>

            <button
              onClick={() => handleSelectOption('empresas')}
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
              🏢 Mayoreo B2B
            </button>

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
