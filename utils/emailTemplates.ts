export type EmailTemplateParams = {
  name: string;
  paymentLink?: string;
  deadline?: string;
  role?: string;
  duration?: string;
  whatsappLink?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const BRAND_THEME = `
  <style>
    .email-shell { margin: 0; padding: 0; background: #eef2f0; }
    .email-table { width: 100%; border-collapse: collapse; }
    .email-container { width: 600px; max-width: 600px; background: #ffffff; border-radius: 14px; overflow: hidden; }
    .padding { padding: 24px; }
    .brand { font-size: 18px; font-weight: 700; color: #166534; }
    .hero { background: #14532d; color: #ffffff; }
    .eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.82; }
    .hero-title { margin: 10px 0 6px; font-size: 24px; line-height: 1.2; font-weight: 700; }
    .hero-copy { margin: 0; font-size: 14px; line-height: 1.6; opacity: 0.9; }
    .highlight { padding: 14px 24px; background: #f0fdf4; border-left: 4px solid #16a34a; color: #14532d; font-weight: 600; }
    .body { padding: 24px; color: #374151; font-size: 14px; line-height: 1.7; }
    .body p { margin: 0 0 14px; }
    .card-row { width: 100%; border-collapse: collapse; }
    .card { background: #f9fafb; padding: 14px; border-radius: 10px; border-bottom: 3px solid #16a34a; vertical-align: top; }
    .card-label { margin: 0; font-size: 11px; color: #6b7280; letter-spacing: 0.12em; text-transform: uppercase; }
    .card-value { margin: 5px 0 0; font-weight: 600; color: #111827; }
    .button-wrap { margin-top: 24px; text-align: center; }
    .button { display: inline-block; background: #16a34a; color: #ffffff !important; padding: 14px 22px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .button-soft { background: #166534; }
    .footer { padding: 18px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
    .footer-note { margin: 0; font-size: 12px; color: #6b7280; text-align: center; }
    .details-box { margin-top: 8px; padding: 14px 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; }
    .details-title { margin: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #6b7280; }
    .details-line { margin: 0 0 8px; color: #111827; }
  </style>
`;

type PremiumEmailOptions = {
  eyebrow: string;
  title: string;
  intro: string;
  highlight?: string;
  body: string[];
  cards?: Array<{ label: string; value: string }>;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

const renderTemplate = ({
  eyebrow,
  title,
  intro,
  highlight,
  body,
  cards = [],
  ctaLabel,
  ctaUrl,
  footerNote = "SkillBridge • Building real skills through real work",
}: PremiumEmailOptions) => `
  ${BRAND_THEME}
  <body class="email-shell" style="margin:0; padding:0; background:#eef2f0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <table class="email-table" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f0;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:14px; overflow:hidden;">
            <tr>
              <td class="padding" style="padding:20px 24px; border-bottom:1px solid #e5e7eb;">
                <span class="brand" style="font-size:18px; font-weight:700; color:#166534;">SkillBridge</span>
              </td>
            </tr>
            <tr>
              <td class="padding hero" style="background:#14532d; color:#ffffff; padding:28px 24px;">
                <p class="eyebrow" style="margin:0; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.82;">${eyebrow}</p>
                <h2 class="hero-title" style="margin:10px 0 6px; font-size:24px; line-height:1.2; font-weight:700;">${title}</h2>
                <p class="hero-copy" style="margin:0; font-size:14px; line-height:1.6; opacity:0.9;">${intro}</p>
              </td>
            </tr>
            ${highlight ? `
            <tr>
              <td class="highlight" style="padding:14px 24px; background:#f0fdf4; border-left:4px solid #16a34a; color:#14532d; font-weight:600;">${highlight}</td>
            </tr>` : ""}
            <tr>
              <td class="body" style="padding:24px; color:#374151; font-size:14px; line-height:1.7;">
                ${body.map((paragraph) => `<p style="margin:0 0 14px;">${paragraph}</p>`).join("")}
                ${cards.length > 0 ? `
                <table class="card-row" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin-top:10px;">
                  ${cards.length > 1 ? `
                  <tr>
                    ${cards.slice(0, 2).map((card) => `<td width="48%" class="card" style="width:48%; background:#f9fafb; padding:14px; border-radius:10px; border-bottom:3px solid #16a34a; vertical-align:top;"><p class="card-label" style="margin:0; font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">${card.label}</p><p class="card-value" style="margin:5px 0 0; font-weight:600; color:#111827;">${card.value}</p></td>`).join('<td style="width:4%;"></td>')}
                  </tr>` : `
                  <tr>
                    <td class="card" style="background:#f9fafb; padding:14px; border-radius:10px; border-bottom:3px solid #16a34a;"><p class="card-label" style="margin:0; font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">${cards[0].label}</p><p class="card-value" style="margin:5px 0 0; font-weight:600; color:#111827;">${cards[0].value}</p></td>
                  </tr>`}
                </table>
                ${cards.length > 2 ? `
                <table class="card-row" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin-top:10px;">
                  <tr>
                    ${cards.slice(2, 4).map((card) => `<td width="48%" class="card" style="width:48%; background:#f9fafb; padding:14px; border-radius:10px; border-bottom:3px solid #16a34a; vertical-align:top;"><p class="card-label" style="margin:0; font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">${card.label}</p><p class="card-value" style="margin:5px 0 0; font-weight:600; color:#111827;">${card.value}</p></td>`).join('<td style="width:4%;"></td>')}
                  </tr>
                </table>` : ""}
                ${cards.length > 4 ? `
                <table class="card-row" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin-top:10px;">
                  <tr>
                    <td class="card" style="background:#f9fafb; padding:14px; border-radius:10px; border-bottom:3px solid #16a34a; vertical-align:top;"><p class="card-label" style="margin:0; font-size:11px; color:#6b7280; letter-spacing:0.12em; text-transform:uppercase;">${cards[4].label}</p><p class="card-value" style="margin:5px 0 0; font-weight:600; color:#111827;">${cards[4].value}</p></td>
                  </tr>
                </table>` : ""}
                ` : ""}
                ${ctaLabel && ctaUrl ? `
                <div class="button-wrap" style="margin-top:24px; text-align:center;">
                  <a href="${ctaUrl}" class="button" style="display:inline-block; background:#16a34a; color:#ffffff !important; padding:14px 22px; text-decoration:none; border-radius:8px; font-weight:600;">${ctaLabel}</a>
                </div>` : ""}
                ${highlight ? "" : ""}
              </td>
            </tr>
            <tr>
              <td class="footer" style="padding:18px; border-top:1px solid #e5e7eb; font-size:12px; color:#9ca3af; text-align:center;">${footerNote}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
`;

export function getSelectionEmailHtml(params: EmailTemplateParams) {
  const name = escapeHtml(params.name || "Candidate");
  return renderTemplate({
    eyebrow: "SKILLBRIDGE • 2026",
    title: "Next Step in Your Application",
    intro: "We reviewed your profile and would like to move forward.",
    highlight: "You’ve been shortlisted for the next step.",
    body: [
      `We reviewed your profile and found it to be a good fit for the type of work we focus on at SkillBridge.`,
      `Based on this, we’d like to move your application forward to the next stage.`,
      `As part of the process, you are required to complete a short assessment designed to evaluate your approach to practical, real-world tasks.`,
    ],
    cards: [
      { label: "Role", value: escapeHtml(params.role || "SDE Intern") },
      { label: "Duration", value: escapeHtml(params.duration || "2 Weeks") },
      { label: "Mode", value: "Remote" },
      { label: "Platform", value: "SkillBridge" },
    ],
    ctaLabel: "Go to Dashboard",
    ctaUrl: params.whatsappLink || "https://skillbridge.co.in/login",
    footerNote: "SkillBridge • Building real skills through real work",
  });
}

export function getPaymentEmailHtml(params: EmailTemplateParams) {
  const name = escapeHtml(params.name || "Candidate");
  const deadline = escapeHtml(params.deadline || "Within 24 hours");
  const paymentLink = params.paymentLink || "#";
  return renderTemplate({
    eyebrow: "SKILLBRIDGE • PAYMENT",
    title: "Complete Enrollment Payment",
    intro: "Your application is moving forward. Please complete payment to confirm your slot.",
    highlight: "Payment required to reserve your internship seat.",
    body: [
      `Hello <strong>${name}</strong>,`,
      `Based on your submission, your profile has moved to the payment stage.`,
      `Please complete payment using the secure link below.`,
    ],
    cards: [
      { label: "Deadline", value: deadline },
      { label: "Status", value: "Awaiting Payment" },
    ],
    ctaLabel: "Complete Payment",
    ctaUrl: paymentLink,
    footerNote: "SkillBridge • Secure enrollment processing",
  });
}

export function getOfferEmailHtml(params: EmailTemplateParams) {
  const name = escapeHtml(params.name || "Candidate");
  const role = escapeHtml(params.role || "Software Engineering Intern");
  const duration = escapeHtml(params.duration || "4 Weeks");
  return renderTemplate({
    eyebrow: "SKILLBRIDGE • OFFER",
    title: "Offer Letter Ready",
    intro: "Your offer letter is prepared and attached with this email.",
    highlight: "Official offer attached. Please review and retain for records.",
    body: [
      `Hello <strong>${name}</strong>,`,
      `Based on your submission and screening progress, your offer letter is now ready for this internship cycle.`,
      `Please review the attached document and keep this email for your records.`,
    ],
    cards: [
      { label: "Role", value: role },
      { label: "Duration", value: duration },
    ],
    footerNote: "SkillBridge • Official offer communication",
  });
}

export function getOnboardingEmailHtml(params: EmailTemplateParams) {
  const name = escapeHtml(params.name || "Candidate");
  const whatsappLink = params.whatsappLink || "#";
  return renderTemplate({
    eyebrow: "SKILLBRIDGE • ONBOARDING",
    title: "Onboarding Instructions",
    intro: "Your onboarding instructions are ready.",
    highlight: "Join the onboarding group and keep your inbox active.",
    body: [
      `Hello <strong>${name}</strong>,`,
      `Based on your submission and completed enrollment, your onboarding instructions are ready.`,
      `Keep your registered email active for all internship updates.`,
    ],
    cards: [
      { label: "Next step", value: "Join onboarding group" },
      { label: "Support", value: "Email + WhatsApp" },
    ],
    ctaLabel: "Join Onboarding Group",
    ctaUrl: whatsappLink,
    footerNote: "SkillBridge • Official onboarding communication",
  });
}

export function getReminderEmailHtml(params: EmailTemplateParams & { stage?: "test" | "payment" | "general"; note?: string }) {
  const name = escapeHtml(params.name || "Candidate");
  const stage = params.stage || "general";
  const stageMessage =
    stage === "payment"
      ? "This is a reminder to complete your enrollment payment to keep your current slot."
      : stage === "test"
        ? "This is a reminder to complete your screening test so your profile can move forward."
        : "This is a follow-up based on your submission and current application stage.";

  return renderTemplate({
    eyebrow: "SKILLBRIDGE • REMINDER",
    title: "Application Reminder",
    intro: stageMessage,
    highlight: "Please respond to this email if you need assistance.",
    body: [
      `Hello <strong>${name}</strong>,`,
      stageMessage,
      `This reminder is based on your current application stage.`,
    ],
    cards: [
      { label: "Stage", value: escapeHtml(stage) },
      { label: "Note", value: params.note ? escapeHtml(params.note) : "No additional note" },
    ],
    footerNote: "SkillBridge • Follow-up communication",
  });
}

export function getCertificateEmailHtml(params: EmailTemplateParams & { internship?: string; certificateId: string }) {
  const name = escapeHtml(params.name || "Candidate");
  const internship = escapeHtml(params.internship || "SkillBridge Internship");
  const certificateId = escapeHtml(params.certificateId);

  return renderTemplate({
    eyebrow: "SKILLBRIDGE • CERTIFICATE",
    title: "Certificate Ready",
    intro: "Your completion certificate has been issued and attached.",
    highlight: "Congratulations on completing this milestone with SkillBridge.",
    body: [
      `Hello <strong>${name}</strong>,`,
      `Based on your submission, your completion certificate has been issued and attached to this email.`,
      `You can now view, share, or download your official verified certificate online.`,
    ],
    cards: [
      { label: "Program", value: internship },
      { label: "Certificate ID", value: certificateId },
    ],
    footerNote: "SkillBridge • Certificate issuance notice",
  });
}

export function getOfferAttachmentEmailHtml(params: EmailTemplateParams) {
  const name = escapeHtml(params.name || "Candidate");
  const role = escapeHtml(params.role || "Software Engineering Intern");
  const duration = escapeHtml(params.duration || "4 Weeks");

  return renderTemplate({
    eyebrow: "SKILLBRIDGE • OFFER",
    title: "Offer Letter Attached",
    intro: "Your official offer letter is attached with this email.",
    highlight: "Please review the attached document and retain it for your records.",
    body: [
      `Hello <strong>${name}</strong>,`,
      `Based on your submission, your official offer letter is attached with this email.`,
    ],
    cards: [
      { label: "Role", value: role },
      { label: "Duration", value: duration },
    ],
    footerNote: "SkillBridge • Offer attachment notice",
  });
}