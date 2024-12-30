import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const sendWelcomeEmail = async (email, username) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Welcome to Findash",
    text: `Hello ${username},\n\nWelcome to Findash! We're excited to have you onboard.\n\nBest Regards,\nYour App Team`,
    html: `<p>Hello <strong>${username}</strong>,</p><p>Welcome to Findash! We're excited to have you onboard.</p><p>Best Regards,<br>Your Portfolio Tracker and Management Team</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendWelcomeEmail;
