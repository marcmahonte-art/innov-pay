import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('MAIL_FROM') || 'Innov Pay <noreply@innovpay.td>';
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not defined. Email notifications will be mocked in the console.');
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    this.logger.log(`Dispatching email to ${to} with subject "${subject}"`);
    if (!this.resend) {
      this.logger.log(`[MOCK EMAIL] To: ${to}\nSubject: ${subject}\nBody: ${html.substring(0, 200)}...`);
      return true;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (response.error) {
        this.logger.error(`Resend dispatch error: ${JSON.stringify(response.error)}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.error(`Resend failed: ${err.message}`);
      return false;
    }
  }

  // --- HTML Email Templates ---

  async sendWelcomeEmail(to: string, merchantName: string) {
    const subject = 'Bienvenue chez Innov Pay — Votre compte marchand est créé';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0A2463;">Bienvenue chez Innov Pay, ${merchantName}!</h2>
        <p>Nous sommes ravis de vous compter parmi nos marchands.</p>
        <p>Votre compte a été créé avec succès. Pour commencer à recevoir des paiements en production, veuillez compléter votre profil de conformité (KYC) sur votre tableau de bord.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${this.configService.get('FRONTEND_URL') || 'https://frontend-polo6.vercel.app'}/dashboard/kyc" style="background-color: #0A2463; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accéder au KYC</a>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
        </p>
      </div>
    `;
    // We send emails in a fire-and-forget manner to keep application response times low.
    this.sendEmail(to, subject, html).catch((err) => this.logger.error(`Failed to send Welcome Email: ${err.message}`));
  }

  async sendPaymentReceivedEmail(to: string, customerName: string, amount: number, currency: string, paymentId: string) {
    const subject = `Paiement reçu — ${amount} ${currency}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #15803D;">Nouveau paiement reçu !</h2>
        <p>Un client vient d'effectuer un paiement réussi sur votre plateforme.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; font-weight: bold; color: #374151;">Montant</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">${amount} ${currency}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; font-weight: bold; color: #374151;">Client</td>
            <td style="padding: 10px 0; text-align: right; color: #111827;">${customerName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; font-weight: bold; color: #374151;">ID Transaction</td>
            <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #6b7280;">${paymentId}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Innov Pay, Service de Paiement CEMAC.
        </p>
      </div>
    `;
    this.sendEmail(to, subject, html).catch((err) => this.logger.error(`Failed to send Payment Received Email: ${err.message}`));
  }

  async sendKycStatusEmail(to: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
    const isApproved = status === 'APPROVED';
    const subject = isApproved 
      ? 'Félicitations — Votre KYC Innov Pay est approuvé' 
      : 'Action requise — Votre document KYC Innov Pay a été rejeté';
      
    const statusColor = isApproved ? '#15803D' : '#B91C1C';
    const statusText = isApproved ? 'Approuvé' : 'Rejeté';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: ${statusColor};">Statut de conformité KYC : ${statusText}</h2>
        <p>Le service de conformité d'Innov Pay a examiné vos documents de soumission.</p>
        ${isApproved 
          ? `<p>Votre compte marchand est désormais entièrement opérationnel en production. Vous pouvez générer des clés API réelles et initier des transactions en direct.</p>`
          : `<p>Malheureusement, un ou plusieurs de vos documents n'ont pas pu être validés.</p>
             <div style="background-color: #FEF2F2; border-left: 4px solid #B91C1C; padding: 15px; margin: 20px 0;">
               <strong style="color: #B91C1C;">Motif du rejet :</strong>
               <p style="margin: 5px 0 0 0; color: #555;">${notes || 'Document illisible ou invalide. Veuillez re-télécharger un document conforme.'}</p>
             </div>
             <p>Veuillez vous connecter sur votre dashboard pour soumettre un nouveau document.</p>`
        }
        <div style="margin: 30px 0; text-align: center;">
          <a href="${this.configService.get('FRONTEND_URL') || 'https://frontend-polo6.vercel.app'}/dashboard/kyc" style="background-color: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accéder à la console KYC</a>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Équipe Conformité Innov Pay.
        </p>
      </div>
    `;
    this.sendEmail(to, subject, html).catch((err) => this.logger.error(`Failed to send KYC Status Email: ${err.message}`));
  }

  async sendPayoutEmail(to: string, amount: number, currency: string, accountDetails: string, reference: string) {
    const subject = `Virement initié — ${amount} ${currency}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0A2463;">Votre demande de virement est en cours de traitement</h2>
        <p>Nous vous informons qu'un virement de fonds a été initié depuis votre compte Innov Pay vers vos coordonnées bancaires ou de mobile money enregistrées.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; font-weight: bold; color: #374151;">Montant</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">${amount} ${currency}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; font-weight: bold; color: #374151;">Coordonnées destinataire</td>
            <td style="padding: 10px 0; text-align: right; color: #111827;">${accountDetails}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0; font-weight: bold; color: #374151;">Référence virement</td>
            <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #6b7280;">${reference}</td>
          </tr>
        </table>
        <p>Les fonds devraient apparaître sous 24 à 48 heures ouvrées selon votre institution.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Service Financier Innov Pay.
        </p>
      </div>
    `;
    this.sendEmail(to, subject, html).catch((err) => this.logger.error(`Failed to send Payout Email: ${err.message}`));
  }

  async sendSecurityAlertEmail(to: string, alertDetails: string, userIp?: string) {
    const subject = 'Alerte de sécurité — Activité suspecte sur votre compte';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #EA580C;">Alerte de sécurité</h2>
        <p>Nous avons détecté une activité qui nécessite votre attention.</p>
        <div style="background-color: #FFF7ED; border-left: 4px solid #EA580C; padding: 15px; margin: 20px 0;">
          <strong style="color: #EA580C;">Détails :</strong>
          <p style="margin: 5px 0 0 0; color: #555;">${alertDetails}</p>
          ${userIp ? `<p style="margin: 5px 0 0 0; color: #555;"><strong>Adresse IP :</strong> ${userIp}</p>` : ''}
        </div>
        <p>Si vous n'êtes pas à l'origine de cette action, nous vous recommandons de réinitialiser immédiatement votre mot de passe et de révoquer vos clés API actives.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Équipe Sécurité Innov Pay.
        </p>
      </div>
    `;
    this.sendEmail(to, subject, html).catch((err) => this.logger.error(`Failed to send Security Alert Email: ${err.message}`));
  }
}
