import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { chatAPI, consultationAPI } from '../../utils/api';
import { getSocket } from '../../utils/socket';

export default function PatientChatPage() {
  const { consultationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    Promise.all([
      chatAPI.getMessages(consultationId),
      consultationAPI.getById(consultationId)
    ]).then(([msgs, cons]) => {
      setMessages(msgs.data || []);
      setConsultation(cons.data);
    }).finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) {
      socket.emit('join_chat', consultationId);
      socket.on('new_message', (msg) => {
        setMessages(prev => {
          const exists = prev.some(m => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
      });
      socket.on('user_typing', ({ userId }) => {
        if (userId !== user?._id) {
          setTyping(true);
          clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setTyping(false), 2000);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('user_typing');
        socket.emit('leave_chat', consultationId);
      }
    };
  }, [consultationId, user?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    try {
      const res = await chatAPI.send(consultationId, content);
      setMessages(prev => {
        const exists = prev.some(m => m._id === res.data._id);
        if (exists) return prev;
        return [...prev, res.data];
      });
    } catch (err) { console.error('Send failed:', err); }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket) socket.emit('typing', { consultationId, userId: user?._id });
  };

  const isMe = useCallback((msg) => {
    return String(msg.sender) === String(user?._id) ||
           msg.senderName === user?.name ||
           msg.senderRole === user?.role;
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="spinner-hh" /></div>;

  const doctor = consultation?.doctor;

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Header */}
        <div className="chat-header animate-slideInDown">
          <button className="btn-outline-navy btn-sm-hh" onClick={() => navigate('/patient/consultations')}>
            <i className="bi bi-arrow-left" />
          </button>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#0B2D6F', fontFamily: 'Poppins', border: '2px solid #BFDBFE' }}>
            {doctor?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
              Dr. {doctor?.name}
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              {doctor?.specialization}
              {consultation?.heartReport && (
                <span style={{ marginLeft: 8 }}>
                  <span className={`badge-hh badge-${consultation.heartReport.status === 'Normal' ? 'normal' : consultation.heartReport.status === 'Warning' ? 'warning' : 'danger'}`} style={{ fontSize: 10 }}>
                    {consultation.heartReport.heartRate} BPM
                  </span>
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', animation: 'pulse-slow 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <i className="bi bi-chat-dots" style={{ fontSize: 40, color: '#CBD5E1' }} />
              <p style={{ color: '#94A3B8', marginTop: 12, fontSize: 14 }}>Start the conversation with your doctor</p>
            </div>
          )}
          {messages.map((msg) => {
            const mine = isMe(msg);
            return (
              <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                {!mine && (
                  <span style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4, fontWeight: 600 }}>
                    Dr. {msg.senderName}
                  </span>
                )}
                <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                  {msg.content}
                </div>
                <span style={{ fontSize: 10, color: '#CBD5E1', marginTop: 4 }}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8', animation: `pulse-slow 1s ${d}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleTyping(); }}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '12px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 24, fontSize: 14, fontFamily: 'DM Sans', outline: 'none', transition: 'all 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#0B2D6F'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            <button type="submit" disabled={!input.trim()} style={{ width: 44, height: 44, background: input.trim() ? '#0B2D6F' : '#E2E8F0', color: input.trim() ? 'white' : '#94A3B8', border: 'none', borderRadius: '50%', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
              <i className="bi bi-send-fill" style={{ fontSize: 16 }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}