const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { 
    user: "20020905xd@gmail.com",
    pass: "ymwb easi bpsq yvds",
  },
});

async function sendEmail(email, otp) {
  await transporter.sendMail({
    to: email,
    subject: "Verify your account",
    from: "20020905xd@gmail.com",
    text: `Your one-time password is ${otp}`,
  });
  console.log("Email sent to", email);
}

module.exports = { sendEmail };
