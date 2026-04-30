const key = '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';
const candidates = [
  'openai/gpt-oss-120b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'qwen/qwen3-coder:free',
];
const prompt = 'Output only valid JSON with nodes and edges arrays for a simple web app.';

(async () => {
  for (const model of candidates) {
    try {
      const start = Date.now();
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 200 })
      });
      const d = await res.json();
      if (res.ok && d.choices?.[0]) {
        console.log('OK', model, (Date.now()-start) + 'ms');
      } else {
        console.log('FAIL', model, (d.error?.message || String(res.status)).slice(0,80));
      }
    } catch(e) {
      console.log('ERR', model, e.message.slice(0,60));
    }
  }
})();
