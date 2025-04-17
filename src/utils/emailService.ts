import { ApplicationData } from "@/types";

interface EmailTemplate {
  subject: string;
  body: (applicant: ApplicationData) => string;
}

// Email templates for different notification types
const emailTemplates: Record<string, EmailTemplate> = {
  interview: {
    subject: "UKRO UNP - Interview Invitation",
    body: (applicant) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://ukro-unp.vercel.app/GAZA%20-%20UKRO.gif" alt="UKRO Logo" style="width: 80px; height: 80px; border-radius: 50%;">
          <h2 style="color: #3b82f6; margin-top: 10px;">Unit Kegiatan Robotika UNP</h2>
        </div>
        
        <p>Halo <strong>${applicant.fullName}</strong>,</p>
        
        <p>Selamat! Kami dengan senang hati mengundang Anda untuk mengikuti tahap wawancara dalam proses rekrutmen Unit Kegiatan Robotika Universitas Negeri Padang.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Detail Wawancara:</strong></p>
          <p style="margin: 5px 0;">Tanggal: [Tanggal Wawancara]</p>
          <p style="margin: 5px 0;">Waktu: [Waktu Wawancara]</p>
          <p style="margin: 5px 0;">Tempat: [Tempat Wawancara]</p>
          <p style="margin: 5px 0;">Pakaian: Kemeja/Kaos berkerah, celana panjang, sepatu</p>
        </div>
        
        <p>Mohon konfirmasi kehadiran Anda dengan membalas email ini. Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
        
        <p>Salam,<br>Tim Rekrutmen UKRO UNP</p>
      </div>
    `
  },
  acceptance: {
    subject: "UKRO UNP - Selamat! Anda Diterima",
    body: (applicant) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://ukro-unp.vercel.app/GAZA%20-%20UKRO.gif" alt="UKRO Logo" style="width: 80px; height: 80px; border-radius: 50%;">
          <h2 style="color: #3b82f6; margin-top: 10px;">Unit Kegiatan Robotika UNP</h2>
        </div>
        
        <p>Halo <strong>${applicant.fullName}</strong>,</p>
        
        <p>Dengan senang hati kami informasikan bahwa Anda telah <strong style="color: #10b981;">DITERIMA</strong> sebagai anggota Unit Kegiatan Robotika Universitas Negeri Padang!</p>
        
        <p>Selamat bergabung dengan keluarga besar UKRO UNP. Kami yakin Anda akan memberikan kontribusi yang berharga bagi organisasi kami.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Langkah Selanjutnya:</strong></p>
          <p style="margin: 5px 0;">1. Hadir pada acara orientasi anggota baru pada [Tanggal Orientasi]</p>
          <p style="margin: 5px 0;">2. Melengkapi berkas keanggotaan yang akan dijelaskan pada saat orientasi</p>
          <p style="margin: 5px 0;">3. Bergabung dengan grup WhatsApp anggota baru: [Link Grup]</p>
        </div>
        
        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
        
        <p>Salam,<br>Tim Rekrutmen UKRO UNP</p>
      </div>
    `
  },
  rejection: {
    subject: "UKRO UNP - Hasil Seleksi Rekrutmen",
    body: (applicant) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://ukro-unp.vercel.app/GAZA%20-%20UKRO.gif" alt="UKRO Logo" style="width: 80px; height: 80px; border-radius: 50%;">
          <h2 style="color: #3b82f6; margin-top: 10px;">Unit Kegiatan Robotika UNP</h2>
        </div>
        
        <p>Halo <strong>${applicant.fullName}</strong>,</p>
        
        <p>Terima kasih atas minat dan partisipasi Anda dalam proses rekrutmen Unit Kegiatan Robotika Universitas Negeri Padang.</p>
        
        <p>Setelah melakukan evaluasi menyeluruh terhadap semua pelamar, dengan berat hati kami informasikan bahwa Anda belum dapat bergabung dengan UKRO UNP pada kesempatan kali ini.</p>
        
        <p>Keputusan ini tidak mencerminkan kemampuan atau potensi Anda secara keseluruhan. Kami mendorong Anda untuk terus mengembangkan minat dan keterampilan di bidang robotika.</p>
        
        <p>Kami mengucapkan terima kasih atas waktu dan usaha yang telah Anda berikan selama proses seleksi.</p>
        
        <p>Salam,<br>Tim Rekrutmen UKRO UNP</p>
      </div>
    `
  },
  reminder: {
    subject: "UKRO UNP - Pengingat Penting",
    body: (applicant) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://ukro-unp.vercel.app/GAZA%20-%20UKRO.gif" alt="UKRO Logo" style="width: 80px; height: 80px; border-radius: 50%;">
          <h2 style="color: #3b82f6; margin-top: 10px;">Unit Kegiatan Robotika UNP</h2>
        </div>
        
        <p>Halo <strong>${applicant.fullName}</strong>,</p>
        
        <p>Ini adalah pengingat penting terkait proses rekrutmen Unit Kegiatan Robotika Universitas Negeri Padang.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Informasi Penting:</strong></p>
          <p style="margin: 5px 0;">[Isi dengan informasi pengingat yang relevan]</p>
        </div>
        
        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
        
        <p>Salam,<br>Tim Rekrutmen UKRO UNP</p>
      </div>
    `
  }
};

/**
 * Prepares email data for sending
 * @param applicant The applicant data
 * @param emailType The type of email to send
 * @returns Email data object with recipient, subject and body
 */
export const prepareEmail = (applicant: ApplicationData, emailType: string) => {
  const template = emailTemplates[emailType];
  
  if (!template) {
    throw new Error(`Email template for type "${emailType}" not found`);
  }
  
  return {
    to: applicant.email,
    subject: template.subject,
    html: template.body(applicant)
  };
};

/**
 * Validates if the email type is supported
 * @param emailType The type of email to validate
 * @returns Boolean indicating if the email type is valid
 */
export const isValidEmailType = (emailType: string): boolean => {
  return Object.keys(emailTemplates).includes(emailType);
};