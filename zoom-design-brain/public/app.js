const $ = (id) => document.getElementById(id);
const toList = (value) =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

function readContext() {
  return {
    projectId: $('projectId').value.trim(),
    projectName: $('projectName').value.trim(),
    clientName: $('clientName').value.trim(),
    category: $('category').value.trim(),
    dimensions: $('dimensions').value.trim(),
    materials: toList($('materials').value),
    colors: toList($('colors').value),
    style: $('style').value.trim(),
    requirements: toList($('requirements').value),
    notes: toList($('notes').value),
    language: $('language').value,
  };
}

function setStatus(text, isError) {
  const el = $('status');
  el.textContent = text;
  el.classList.toggle('error', !!isError);
}

async function send() {
  const message = $('message').value.trim();
  if (!message) return setStatus('اكتب طلبك الأول.', true);

  $('send').disabled = true;
  setStatus('جاري التفكير...');
  $('output').textContent = '';

  try {
    const res = await fetch('/zoom-design/brain', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: $('action').value,
        message,
        requestId: `web-${Date.now()}`,
        context: readContext(),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setStatus(`${data.errorCode || res.status}: ${data.message || 'خطأ غير معروف'}`, true);
      return;
    }
    $('output').textContent = data.result.content;
    setStatus(`تم — ${data.action}`);
    loadMemory(true);
  } catch (err) {
    setStatus(`تعذر الاتصال بالسيرفر: ${err.message}`, true);
  } finally {
    $('send').disabled = false;
  }
}

async function loadMemory(silent) {
  const projectId = $('projectId').value.trim();
  if (!projectId) {
    if (!silent) setStatus('اكتب Project ID الأول.', true);
    return;
  }
  const res = await fetch(`/zoom-design/memory/${encodeURIComponent(projectId)}`);
  const data = await res.json();
  $('memoryView').textContent = data.success
    ? JSON.stringify(data.memory, null, 2)
    : 'مفيش ذاكرة محفوظة للمشروع ده.';
}

$('send').addEventListener('click', send);
$('loadMemory').addEventListener('click', () => loadMemory(false));
$('message').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send();
});
