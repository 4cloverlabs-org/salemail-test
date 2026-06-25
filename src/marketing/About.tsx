import { useNavigate } from 'react-router-dom';
import { Compass, Feather, ShieldCheck, Users } from 'lucide-react';

const VALUES = [
  { icon: Feather, title: 'Simple by default', desc: 'Every feature has to earn its place. If it doesn’t help close a deal, it doesn’t ship.' },
  { icon: Compass, title: 'Clarity over clutter', desc: 'We design for the salesperson on a busy day, not the demo. Fast, obvious, out of the way.' },
  { icon: ShieldCheck, title: 'Your data is yours', desc: 'No lock-in, no dark patterns. Export everything, anytime, in a format you can use.' },
  { icon: Users, title: 'Built with users', desc: 'We ship small, listen closely, and let real sales teams shape the roadmap.' },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="cc-page-hero cc-reveal">
          <span className="cc-eyebrow">About</span>
          <h1>A CRM that gets out of your way.</h1>
          <p>We started CloseCRM with one belief: software should help you sell, not give you more to manage.</p>
        </div>

        <div className="cc-prose cc-narrow cc-reveal">
          <p>
            Most CRMs grow by adding. More fields, more modules, more settings — until the tool meant to
            organize your work becomes another job. Salespeople end up spending their time feeding the system
            instead of talking to customers, and the data inside it slowly stops being trustworthy.
          </p>
          <p>
            We took the opposite approach. CloseCRM does the few things sales teams genuinely need — contacts,
            a pipeline you can trust, scheduling that just works, and clear insight into what’s happening — and
            it does them quickly and clearly. Nothing you have to learn for a week. Nothing you’ll dread updating.
          </p>
          <p>
            The result is a CRM people actually keep current, because keeping it current takes seconds. And a
            pipeline that’s current is a pipeline you can make decisions from.
          </p>
        </div>

        <div className="cc-values">
          {VALUES.map(v => {
            const Icon = v.icon;
            return (
              <div className="cc-value-card cc-reveal" key={v.title}>
                <span className="cc-value-ic"><Icon size={20} /></span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="cc-cta cc-reveal" style={{ marginTop: 8 }}>
          <h2>Want to see it in action?<span className="dim">It takes minutes to set up.</span></h2>
          <div className="cc-cta-btns">
            <button className="cc-btn cc-btn-primary" onClick={() => navigate('/signup')}>Get started</button>
            <button className="cc-btn cc-btn-ghost" onClick={() => navigate('/contact')}>Talk to us</button>
          </div>
        </div>
      </div>
    </div>
  );
}
