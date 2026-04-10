import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { chatAPI, consultationAPI } from '../../utils/api';
import { connectSocket } from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';

export default function ChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    Promise.all([
      chatAPI.messages(consultationId),
      consultationAPI.get(consultationId)
    ]).then(([msgRes, consRes]) => {
      setMessages(msgRes.data);
      setConsultation(consRes.data);
    }).catch(console.error).finally(() => setLoading(false));

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.emit('join_chat', consultationId);

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_typing', ({ isTyping }) => {
      setOtherTyping(isTyping);
    });

    return () => {
      socket.emit('leave_chat', consultationId);
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [consultationId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!typing && socketRef.current) {
      setTyping(true);
      socketRef.current.emit('typing', { consultationId, isTyping: true });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      if (socketRef.current) {
        socketRef.current.emit('typing', { consultationId, isTyping: false });
      }
    }, 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    try {
      await chatAPI.send(consultationId, content);
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const other = user?.role === 'patient'
    ? { name: consultation?.doctor?.name, label: 'Dr.' }
    : { name: consultation?.patient?.name, label: '' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
        {/* Chat header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>←</button>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--crimson), var(--crimson-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>
            {user?.role === 'patient' ? '👨‍⚕️' : '🧑‍💼'}
          </div>
          <div>
            <h3 style={{ fontSize: 16 }}>{other.label} {other.name || 'Loading...'}</h3>
            {consultation && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {user?.role === 'patient' ? consultation?.doctor?.specialization : `Patient · Age ${consultation?.patient?.age}`}
              </p>
            )}
          </div>

          {consultation?.heartReport && (
            <div style={{
              marginLeft: 'auto', padding: '8px 14px',
              background: 'var(--bg-surface)', borderRadius: 10,
              fontSize: 13
            }}>
              ❤️ {consultation.heartReport.heartRate} BPM
              <span className={`badge badge-${consultation.heartReport.status === 'Normal' ? 'normal' : consultation.heartReport.status === 'Warning' ? 'warning' : 'danger'}`} style={{ marginLeft: 8, fontSize: 11 }}>
                {consultation.heartReport.status}
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p>Start the consultation. Say hello!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.sender === user?._id || msg.senderName === user?.name;
              return (
                <div key={msg._id} style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  animation: 'fadeInUp 0.2s ease'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? 'linear-gradient(135deg, var(--crimson), var(--crimson-light))' : 'var(--bg-elevated)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    color: isMe ? 'white' : 'var(--text-primary)'
                  }}>
                    {!isMe && (
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.7 }}>
                        {msg.senderName}
                      </div>
                    )}
                    <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                    <p style={{ fontSize: 10, marginTop: 6, opacity: 0.6, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {otherTyping && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--crimson-light)',
                    animation: `heartbeat 1s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)'
        }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              value={input}
              onChange={handleTyping}
              placeholder="Type your message..."
              autoComplete="off"
            />
            <button className="btn btn-primary" type="submit" disabled={!input.trim()}>
              Send →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
