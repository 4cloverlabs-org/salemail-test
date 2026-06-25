import { useState, type FormEvent } from 'react';
import { Mail, MessageSquare, MapPin, Check } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSent(true);
  };

  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="cc-page-hero cc-reveal">
          <span className="cc-eyebrow">Contact</span>
          <h1>Let’s talk.</h1>
          <p>Questions about CloseCRM, pricing, or migrating from another tool? We’re happy to help.</p>
        </div>

        <div className="cc-contact-grid">
          {/* Methods */}
          <div className="cc-contact-side cc-reveal">
            <div className="cc-contact-method">
              <span className="cc-contact-ic"><Mail size={18} /></span>
              <div>
                <h4>Email us</h4>
                <a href="mailto:hello@closecrm.io">hello@closecrm.io</a>
                <p>We reply within one business day.</p>
              </div>
            </div>
            <div className="cc-contact-method">
              <span className="cc-contact-ic"><MessageSquare size={18} /></span>
              <div>
                <h4>Sales & demos</h4>
                <a href="mailto:sales@closecrm.io">sales@closecrm.io</a>
                <p>See CloseCRM in action with your own workflow.</p>
              </div>
            </div>
            <div className="cc-contact-method">
              <span className="cc-contact-ic"><MapPin size={18} /></span>
              <div>
                <h4>Office</h4>
                <p>Remote-first team, working across time zones.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="cc-contact-form cc-reveal">
            {sent ? (
              <div className="cc-contact-success">
                <span className="cc-contact-check"><Check size={22} /></span>
                <h3>Thanks, {form.name.split(' ')[0] || 'there'}!</h3>
                <p>Your message is on its way. We’ll get back to you at {form.email} shortly.</p>
                <button className="cc-btn cc-btn-ghost" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3>Send us a message</h3>
                <div className="cc-fieldrow">
                  <label>
                    <span>Name</span>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Cooper" required />
                  </label>
                  <label>
                    <span>Email</span>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" required />
                  </label>
                </div>
                <label>
                  <span>Message</span>
                  <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" required />
                </label>
                <button type="submit" className="cc-btn cc-btn-primary cc-btn-block">Send message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
