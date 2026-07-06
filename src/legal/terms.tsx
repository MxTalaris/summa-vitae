const s = {
  wrap:    { fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.8 } as React.CSSProperties,
  date:    { fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '.1em', marginBottom: 20, fontFamily: 'var(--mono)' } as React.CSSProperties,
  intro:   { marginBottom: 16 } as React.CSSProperties,
  h:       { fontWeight: 700, color: 'var(--ink)', fontSize: 14, marginTop: 24, marginBottom: 8 } as React.CSSProperties,
  p:       { marginBottom: 12 } as React.CSSProperties,
  last:    { marginBottom: 0 } as React.CSSProperties,
};

export function TermsContent() {
  return (
    <div style={s.wrap}>
      <p style={s.date}>Effective Date: July 6, 2026</p>

      <p style={s.intro}>
        By accessing or using Summa Vitae ("the App"), you agree to be bound by these Terms of Service.
      </p>

      <p className="serif" style={s.h}>1. Description of Service</p>
      <p style={s.p}>
        Summa Vitae provides a client-side interface designed to manage a master "Base CV", trim it
        into tailored versions, and customize visual layouts. The App leverages the user's personal
        Google Drive account for cross-device data storage.
      </p>

      <p className="serif" style={s.h}>2. Cost of Service</p>
      <p style={s.p}>
        Summa Vitae is provided entirely free of charge. There are no premium tiers, hidden fees,
        or paid features.
      </p>

      <p className="serif" style={s.h}>3. User Responsibilities &amp; Account Security</p>
      <p style={s.p}>
        <strong>Data Ownership:</strong> Full ownership, intellectual property rights, and
        responsibility for all text, data, and layouts created using the App remain with the user.
      </p>
      <p style={s.p}>
        <strong>Account Credentials:</strong> To utilize cross-device synchronization, a personal
        Google Account must be linked. Maintenance of Google account security is the sole
        responsibility of the user.
      </p>
      <p style={s.p}>
        <strong>Acceptable Use:</strong> The App must not be used to generate, store, or distribute
        content that is illegal, defamatory, or violates the rights of any third party.
      </p>

      <p className="serif" style={s.h}>4. Intellectual Property and Licensing</p>
      <p style={s.p}>
        Summa Vitae is an open-source project. The source code for the application is licensed
        under the permissive MIT License.
      </p>
      <p style={s.p}>
        You can view, copy, modify, distribute, and build upon the source code in accordance with
        the license terms found in the official GitHub repository: <a href="https://github.com/MxTalaris/summa-vitae/?tab=MIT-1-ov-file" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
          https://github.com/MxTalaris/summa-vitae/?tab=MIT-1-ov-file
        </a>
      </p>
      <p style={s.p}>
        While the underlying code is open-source, the name "Summa Vitae" and any distinct logo or
        branding assets associated with the hosted web application remain the property of the
        project's creator.
      </p>

      <p className="serif" style={s.h}>5. Disclaimer of Warranties</p>
      <p style={s.p}>
        Summa Vitae is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any
        kind, either express or implied, including but not limited to the implied warranties of
        merchantability or fitness for a particular purpose, as detailed in the MIT License.
      </p>
      <p style={s.p}>
        There is no warranty that the App will be uninterrupted, error-free, or entirely secure.
      </p>
      <p style={s.p}>
        Because data storage is restricted to local browser caches and personal Google Drive
        accounts, no responsibility or liability is assumed for data loss resulting from Google API
        interruptions, browser cache clearing, or accidental file deletion.
      </p>

      <p className="serif" style={s.h}>6. Limitation of Liability</p>
      <p style={s.p}>
        To the maximum extent permitted by applicable law, in no event shall the creator of Summa
        Vitae be liable for any direct, indirect, incidental, special, or consequential damages
        (including, but not limited to, loss of data, loss of employment opportunities, or business
        interruption) arising out of the use or inability to use the App.
      </p>

      <p className="serif" style={s.h}>7. Modifications and Termination</p>
      <p style={s.p}>
        Usage of the App may be discontinued at any time. Summa Vitae reserves the right to
        modify, suspend, or discontinue the web application (or any part thereof) at any time,
        with or without notice.
      </p>

      <p className="serif" style={s.h}>8. Governing Law</p>
      <p style={s.p}>
        These Terms shall be governed by and construed in accordance with applicable law, without
        regard to conflict of law provisions.
      </p>

      <p className="serif" style={s.h}>9. Contact Information</p>
      <p style={s.last}>
        Inquiries regarding these Terms can be sent to:{' '}
        <a href="mailto:kev.talarico@gmail.com" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
          kev.talarico@gmail.com
        </a>
      </p>
    </div>
  );
}
