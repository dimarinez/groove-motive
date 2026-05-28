const escapeHtml = (value) => (
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
);

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
};

export async function sendOpenDecksEmail(submission, apiKey) {
  if (!apiKey) {
    return {
      status: 500,
      body: { error: 'Resend API key is not configured.' }
    };
  }

  const emailText = [
    'New Groove Motive Open Decks submission:',
    '',
    `Name: ${submission.name}`,
    `Age: ${submission.age}`,
    `From: ${submission.hometown}`,
    `Instagram: ${submission.instagram_handle}`
  ].join('\n');

  const emailHtml = `
    <h1>New Open Decks Submission</h1>
    <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
    <p><strong>Age:</strong> ${escapeHtml(submission.age)}</p>
    <p><strong>From:</strong> ${escapeHtml(submission.hometown)}</p>
    <p><strong>Instagram:</strong> ${escapeHtml(submission.instagram_handle)}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Groove Motive <dillon@chize.dev>',
      to: ['luke@groovemotiverecs.com'],
      subject: 'GROOVE MOTIVE OPEN DECKS SUBMISSION',
      text: emailText,
      html: emailHtml
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      status: response.status,
      body: { error: errorText || 'Email failed to send.' }
    };
  }

  return {
    status: 200,
    body: { ok: true }
  };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const submission = await readJsonBody(request);
    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
    const result = await sendOpenDecksEmail(submission, apiKey);

    return response.status(result.status).json(result.body);
  } catch (error) {
    console.error('Open Decks email failed:', error);
    return response.status(500).json({ error: 'Email failed to send.' });
  }
}
