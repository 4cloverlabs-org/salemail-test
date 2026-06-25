import { MapPin, ArrowRight } from 'lucide-react';

const ROLES = [
  { title: 'Senior Product Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Lead', team: 'Customer', location: 'Remote', type: 'Full-time' },
  { title: 'Content & SEO Marketer', team: 'Marketing', location: 'Remote', type: 'Contract' },
];

const PERKS = [
  'Remote-first, async by default',
  'Real ownership and small teams',
  'Flexible hours across time zones',
  'Budget for learning and equipment',
];

export default function Careers() {
  return (
    <div className="cc-page">
      <div className="cc-container">
        <div className="cc-page-hero cc-reveal">
          <span className="cc-eyebrow">Careers</span>
          <h1>Build the CRM you wish you had.</h1>
          <p>We’re a small, focused team that ships often and sweats the details. If that sounds like you, take a look.</p>
        </div>

        <div className="cc-perks cc-reveal">
          {PERKS.map(p => <span key={p} className="cc-perk">{p}</span>)}
        </div>

        <div className="cc-roles">
          <h3 className="cc-more-title">Open roles</h3>
          {ROLES.map(r => (
            <a key={r.title} href="mailto:careers@closecrm.io?subject=Application: " className="cc-role cc-reveal">
              <div>
                <div className="cc-role-title">{r.title}</div>
                <div className="cc-role-meta">
                  <span>{r.team}</span><span className="dot">·</span>
                  <span className="cc-role-loc"><MapPin size={12} /> {r.location}</span><span className="dot">·</span>
                  <span>{r.type}</span>
                </div>
              </div>
              <span className="cc-role-apply">Apply <ArrowRight size={15} /></span>
            </a>
          ))}
        </div>

        <p className="cc-roles-note cc-reveal">
          Don’t see your role? We’re always glad to meet good people — write to us at{' '}
          <a href="mailto:careers@closecrm.io">careers@closecrm.io</a>.
        </p>
      </div>
    </div>
  );
}
