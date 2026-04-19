const { generateCertificatePdf } = require('../utils/pdfGenerator');
const { generateCertificateId } = require('../utils/generateCertificateId');
const { renderPremiumEmail } = require('../utils/emailTemplates');
const emailServiceModule = require('./email.service');
const logger = require('../utils/logger');

const emailService = emailServiceModule.emailService || emailServiceModule;

function getWorkspaceCertificateEmailHtml({ name, projectTitle, certificateId, downloadLink }) {
  return renderPremiumEmail({
    eyebrow: 'SKILLBRIDGE • WORKSPACE CERTIFICATE',
    title: 'SkillBridge Internship Certificate',
    intro: 'Your workspace project has been approved.',
    highlight: 'Congratulations! Your internship certificate is attached with this email.',
    body: [
      `Hi <strong>${name}</strong>,`,
      `Your submission for <strong>${projectTitle}</strong> was approved by the SkillBridge team.`,
      'You can find your certificate attached. Keep this email for your records.',
    ],
    cards: [
      { label: 'Certificate ID', value: certificateId },
      { label: 'Project', value: projectTitle },
    ],
    ctaLabel: downloadLink ? 'Open Certificate' : undefined,
    ctaUrl: downloadLink || undefined,
    footerNote: 'SkillBridge • Workspace completion certificate',
  });
}

async function sendWorkspaceCertificateEmail({ userEmail, userName, projectTitle }) {
  const certificateId = generateCertificateId();
  const pdfBuffer = await generateCertificatePdf({
    studentName: userName,
    internship: projectTitle,
    issueDate: new Date(),
    certificateId,
  });

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const downloadLink = `${baseUrl}/verify-certificate?id=${encodeURIComponent(certificateId)}`;

  await emailService.send({
    to: userEmail,
    subject: 'SkillBridge Internship Certificate',
    html: getWorkspaceCertificateEmailHtml({
      name: userName,
      projectTitle,
      certificateId,
      downloadLink,
    }),
    attachments: [
      {
        filename: `skillbridge-certificate-${certificateId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  logger.info('workspace.certificate.email_sent', { email: userEmail, certificateId });
  return { certificateId, downloadLink };
}

module.exports = {
  sendWorkspaceCertificateEmail,
};
