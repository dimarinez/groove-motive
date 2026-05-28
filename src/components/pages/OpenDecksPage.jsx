import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Footer from '../Footer';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const initialFormData = {
  name: '',
  age: '',
  from: '',
  instagram: ''
};

export default function OpenDecksPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitState, setSubmitState] = useState('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    gsap.fromTo('.open-decks-page .page-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'Power2.out' }
    );

    gsap.fromTo('.open-decks-form',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' }
    );
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const sendSubmissionEmail = async (submission) => {
    const response = await fetch('/api/send-open-decks-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submission)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Email failed to send.');
    }
  };

  const saveSubmission = async (submission) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/open_decks_submissions`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(submission)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Submission failed to save.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabaseUrl || !supabaseAnonKey) {
      setSubmitState('error');
      setSubmitMessage('Submission is not configured yet.');
      return;
    }

    const submission = {
      name: formData.name.trim(),
      age: Number(formData.age),
      hometown: formData.from.trim(),
      instagram_handle: formData.instagram.trim()
    };

    setSubmitState('submitting');
    setSubmitMessage('');

    try {
      await saveSubmission(submission);
      await sendSubmissionEmail(submission);
      setFormData(initialFormData);
      setSubmitState('success');
      setSubmitMessage('Submission received.');
    } catch (error) {
      console.error('Open Decks submission failed:', error);
      setSubmitState('error');
      setSubmitMessage('Submission failed. Please try again.');
    }
  };

  return (
    <div className="page open-decks-page">
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Open Decks</h1>
          </div>

          <div className="open-decks-content">
            <form
              className="open-decks-form"
              onSubmit={handleSubmit}
            >
              <label className="form-field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="form-field">
                <span>Age</span>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="120"
                  inputMode="numeric"
                  required
                />
              </label>

              <label className="form-field">
                <span>Where are you from?</span>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  required
                />
              </label>

              <label className="form-field">
                <span>Instagram handle</span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@handle"
                  autoComplete="off"
                  required
                />
              </label>

              <button
                type="submit"
                className="form-submit"
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting' ? 'Submitting' : 'Submit'}
              </button>

              {submitMessage && (
                <p className={`form-status ${submitState}`}>{submitMessage}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
