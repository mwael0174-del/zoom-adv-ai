import { useEffect, useRef, useState } from 'react';
import { useCampaigns } from '../context/CampaignsContext';
import { generateAISuggestion } from '../services/aiService';
import './AIAssistant.css';

const QUICK = [
  'ما أفضل حملة أداءً؟',
  'اقترح توزيع الميزانية',
  'اكتب نص إعلان جذاب',
  'نصائح لتحسين CTR',
  'أظهر الحملات المتوقفة',
];

const INITIAL_MESSAGES = [
  { role: 'ai', text: 'مرحبًا! أنا مساعد Zoom Adv AI. اسألني عن حملاتك، الميزانية، أو اطلب نصوص إعلانات.' },
];

export default function AIAssistant() {
  const { campaigns } = useCampaigns();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // تمرير تلقائي لآخر رسالة
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const reply = generateAISuggestion(q, campaigns);
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
      setLoading(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => setMessages(INITIAL_MESSAGES);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>مساعد AI</h2>
          <p>تحليل ذكي واقتراحات لحملاتك الإعلانية</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={clearChat} title="مسح المحادثة">
          🗑 مسح
        </button>
      </div>

      <div className="ai-layout">
        <div className="card ai-chat">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.role === 'ai' && <span className="bubble-avatar">AI</span>}
                <div className="bubble-text">{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble ai">
                <span className="bubble-avatar">AI</span>
                <div className="bubble-text typing">جارٍ التحليل...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل عن حملاتك... (Enter للإرسال)"
              disabled={loading}
              aria-label="رسالة للمساعد"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              إرسال
            </button>
          </div>
        </div>

        <div className="ai-sidebar">
          <div className="card">
            <div className="card-title">أسئلة سريعة</div>
            <div className="quick-btns">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="quick-btn"
                  onClick={() => send(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title">إحصائيات سريعة</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 2 }}>
              <div>📊 الحملات: {campaigns.length}</div>
              <div>✅ النشطة: {campaigns.filter((c) => c.status === 'active').length}</div>
              <div>
                📈 أعلى CTR:{' '}
                {campaigns.length > 0
                  ? `${Math.max(...campaigns.map((c) => c.ctr))}%`
                  : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
