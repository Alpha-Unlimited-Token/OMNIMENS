/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized access, copying, distribution,
 * reverse engineering, or disclosure is strictly prohibited.
 */

// SendGrid integration — Replit connector
import sgMail from '@sendgrid/mail';

let _cachedCredentials: { apiKey: string; email: string } | null = null;
let _credentialsFetchedAt = 0;
const CREDENTIALS_TTL = 5 * 60 * 1000;

async function getCredentials(): Promise<{ apiKey: string; email: string }> {
  if (_cachedCredentials && Date.now() - _credentialsFetchedAt < CREDENTIALS_TTL) {
    return _cachedCredentials;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found');
  }

  const res = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken,
      },
    }
  );
  const data = await res.json();
  const conn = data.items?.[0];

  if (!conn?.settings?.api_key || !conn?.settings?.from_email) {
    throw new Error('SendGrid not connected');
  }

  _cachedCredentials = { apiKey: conn.settings.api_key, email: conn.settings.from_email };
  _credentialsFetchedAt = Date.now();
  return _cachedCredentials;
}

const LEGAL_EMAIL = 'legal@omnimens-ai.com';

export async function sendLegalNotification(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const { apiKey, email } = await getCredentials();
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to,
      from: { email: LEGAL_EMAIL, name: 'OMNIMENS Legal' },
      replyTo: { email: LEGAL_EMAIL, name: 'OMNIMENS Legal' },
      subject,
      html: body,
    });
    console.log(`[SENDGRID] ✅ Legal notification sent to ${to}: ${subject}`);
    return true;
  } catch (err: any) {
    console.error(`[SENDGRID] ❌ Failed to send: ${err?.message || err}`);
    return false;
  }
}

export async function sendSecurityAlert(
  subject: string,
  details: string
): Promise<boolean> {
  return sendLegalNotification(
    LEGAL_EMAIL,
    `[SECURITY ALERT] ${subject}`,
    `<h2>OMNIMENS Security Alert</h2>
     <p><strong>Time:</strong> ${new Date().toISOString()}</p>
     <p><strong>Subject:</strong> ${subject}</p>
     <hr/>
     <pre>${details}</pre>
     <hr/>
     <p><em>This is an automated alert from the OMNIMENS security system.</em></p>
     <p>© 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.</p>`
  );
}

export async function sendBreachNotification(
  description: string,
  affectedSystems: string[],
  severity: 'low' | 'medium' | 'high' | 'critical'
): Promise<boolean> {
  const severityColors: Record<string, string> = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545',
  };

  return sendLegalNotification(
    LEGAL_EMAIL,
    `[BREACH ${severity.toUpperCase()}] ${description}`,
    `<div style="border-left: 4px solid ${severityColors[severity]}; padding-left: 16px;">
       <h2>OMNIMENS Breach Notification</h2>
       <p><strong>Severity:</strong> <span style="color: ${severityColors[severity]}; font-weight: bold;">${severity.toUpperCase()}</span></p>
       <p><strong>Time:</strong> ${new Date().toISOString()}</p>
       <p><strong>Description:</strong> ${description}</p>
       <p><strong>Affected Systems:</strong></p>
       <ul>${affectedSystems.map(s => `<li>${s}</li>`).join('')}</ul>
       <hr/>
       <p><strong>Immediate Actions Required:</strong></p>
       <ol>
         <li>Assess the scope of the breach</li>
         <li>Preserve all related logs and evidence</li>
         <li>Determine if trade secret material was exposed</li>
         <li>Engage legal counsel if necessary</li>
       </ol>
       <hr/>
       <p><em>Per TRADE_SECRET_POLICY.md Section 5.2 — this alert was generated within 1 hour of detection.</em></p>
       <p>© 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.</p>
     </div>`
  );
}

export function getSendGridStatus(): { configured: boolean; legalEmail: string } {
  return {
    configured: !!process.env.REPLIT_CONNECTORS_HOSTNAME,
    legalEmail: LEGAL_EMAIL,
  };
}
