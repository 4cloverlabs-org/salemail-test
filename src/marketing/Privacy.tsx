export default function Privacy() {
  return (
    <div className="cc-page">
      <div className="cc-container cc-legal">
        <div className="cc-page-hero" style={{ textAlign: 'left', margin: '0 0 32px' }}>
          <span className="cc-eyebrow">Legal</span>
          <h1>Privacy Policy</h1>
          <p style={{ margin: 0 }}>Last updated: June 1, 2026</p>
        </div>

        <div className="cc-prose">
          <p>This Privacy Policy explains how CloseCRM (“we”, “us”) collects, uses, and protects information when you use our website and product (the “Service”). We keep this policy plain and short on purpose.</p>

          <h2>Information we collect</h2>
          <p>We collect the information you give us and the minimum we need to run the Service:</p>
          <ul>
            <li><strong>Account information</strong> — your name, email address, and company, provided when you sign up.</li>
            <li><strong>Customer data</strong> — the contacts, deals, notes, and activity you store in CloseCRM. This data belongs to you.</li>
            <li><strong>Usage information</strong> — basic, aggregated analytics about how the Service is used, so we can improve it.</li>
            <li><strong>Connected accounts</strong> — if you connect a calendar or other integration, we access only the data needed to provide that feature.</li>
          </ul>

          <h2>How we use information</h2>
          <p>We use information to provide and maintain the Service, to support you, to keep the Service secure, and to communicate important updates. We do not sell your personal information, and we do not use your customer data to train models or for advertising.</p>

          <h2>How we share information</h2>
          <p>We share information only with service providers who help us operate the Service (such as hosting and email delivery), under agreements that require them to protect it. We may disclose information if required by law. If we’re ever involved in a merger or acquisition, we’ll notify you before your information becomes subject to a different policy.</p>

          <h2>Data retention and deletion</h2>
          <p>We keep your data for as long as your account is active. You can export your data at any time, and you can delete your account whenever you choose. After cancellation, we retain your data for 30 days so you can recover it, then permanently delete it.</p>

          <h2>Security</h2>
          <p>We protect your data with encryption in transit, access controls, and regular review of our practices. No system is perfectly secure, but we treat your data as if it were our own.</p>

          <h2>Your rights</h2>
          <p>You can access, correct, export, or delete your personal information at any time from your account, or by contacting us. Depending on where you live, you may have additional rights under local law, and we’ll honor them.</p>

          <h2>Contact</h2>
          <p>Questions about this policy? Email us at <a href="mailto:privacy@closecrm.io">privacy@closecrm.io</a> and a real person will respond.</p>
        </div>
      </div>
    </div>
  );
}
