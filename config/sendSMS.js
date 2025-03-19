const axios = require("axios");

const api = axios.create({
  baseURL: "https://notify.eskiz.uz/api/",
  headers: {
    Authorization:
      // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQ5NzA1NDcsImlhdCI6MTc0MjM3ODU0Nywicm9sZSI6InRlc3QiLCJzaWduIjoiZmEyYWYxNzY5ZmRhZmRiZjFjMzhjZDg1MmU0ZDIxODA4M2NjY2IzNGQ0ODkxZTY0MDNjYTllN2M2NWJhMDA4NSIsInN1YiI6IjEwMTM4In0.79MWWI2slueMSoLGFmTiIQ92NZO88qe6y-vfXhwZQww",
      "",
  },
});

async function sendSMS(tel, otp) {
  try {
    let r = await api.post("message/sms/send", {
      mobile_phone: tel,
      message: "Bu Eskiz dan test",
      from: "4546",
    });
    console.log(r);

    console.log("sended sms", tel, otp);
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendSMS;
