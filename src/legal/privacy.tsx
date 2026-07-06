const s = {
  wrap:  { fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.8 } as React.CSSProperties,
  date:  { fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '.1em', marginBottom: 20, fontFamily: 'var(--mono)' } as React.CSSProperties,
  intro: { marginBottom: 16 } as React.CSSProperties,
  h:     { fontWeight: 700, color: 'var(--ink)', fontSize: 14, marginTop: 24, marginBottom: 8 } as React.CSSProperties,
  p:     { marginBottom: 12 } as React.CSSProperties,
  last:  { marginBottom: 0 } as React.CSSProperties,
};

export function PrivacyContent() {
  return (
    <div style={s.wrap}>
      <p style={s.date}>Effective Date: July 6, 2026</p>

      <p style={s.intro}>
        User privacy is a core priority for Summa Vitae. Because the application is designed as a
        client-side utility, no personal data or CV information is collected, stored, or accessed
        by any backend server or external party.
      </p>
      <p style={s.intro}>
        This Privacy Policy explains how the application interacts with local devices and Google
        Drive accounts.
      </p>

      <p className="serif" style={s.h}>1. Data Collection (or rather, lack thereof)</p>
      <p style={s.p}>
        <strong>No Server-Side Storage:</strong> Summa Vitae does not operate databases or
        infrastructure to store CV text, user configurations, or personal details.
      </p>
      <p style={s.p}>
        <strong>No Information Harvesting:</strong> No identity tracking, job search history
        monitoring, or analysis of the content input into a "Base CV" is performed.
      </p>

      <p className="serif" style={s.h}>2. Google Drive Integration &amp; Data Usage</p>
      <p style={s.p}>
        Summa Vitae integrates directly with Google Drive to provide cloud-saving capabilities,
        enabling seamless device switching.
      </p>
      <p style={s.p}>
        <strong>Drive Access Authorization:</strong> The application requests permission to access
        Google Drive via the limited <code>drive.file</code> scope. This restricts Summa Vitae's
        access only to the specific files created by this application.
      </p>
      <p style={s.p}>
        <strong>Data Transmission:</strong> All data synchronization happens directly between the
        local web browser and Google's official servers. At no point is Google data transmitted to,
        viewed by, or stored on any third-party servers.
      </p>
      <p style={s.p}>
        <strong>Revoking Access:</strong> Access to Google Drive can be revoked at any time through
        the linked Google Account Security Settings.
      </p>

      <p className="serif" style={s.h}>3. Third-Party Services</p>
      <p style={s.p}>
        Aside from the official Google Drive API integration authorized by the user, Summa Vitae
        does not share, sell, or distribute any data to third-party services, analytics platforms,
        or advertisers.
      </p>

      <p className="serif" style={s.h}>4. Data Security</p>
      <p style={s.p}>
        Because data is stored entirely within the user's browser cache and personal Google Drive
        account, data security relies on the protocols provided by Google and local device
        security. Users are encouraged to maintain strong passwords and enable two-factor
        authentication on their Google Accounts.
      </p>

      <p className="serif" style={s.h}>5. Changes to this Policy</p>
      <p style={s.p}>
        This Privacy Policy may be updated from time to time to reflect functional updates to the
        application. Any modifications will be posted directly to this page with a revised
        effective date.
      </p>

      <p className="serif" style={s.h}>6. Contact Information</p>
      <p style={s.last}>
        For any questions regarding this Privacy Policy or data handling practices, inquiries can
        be directed to:{' '}
        <a href="mailto:kev.talarico@gmail.com" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
          kev.talarico@gmail.com
        </a>
      </p>
    </div>
  );
}
