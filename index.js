const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const MONGO_CONN = process.env.MONGO_CONN;

const app = express();
app.use(express.json());
app.use('/', express.static(path.join(process.cwd(), './')));
app.use(cors());

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_CONN, { dbName: 'Registerations' })
  .then(() => console.log('Connection to Registerations Done!'))
  .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  contactno: String,
  college: String,
  yds: String,
  events: [String]
});

const userModel = mongoose.model('participants', userSchema);

app.post('/create-user', (req, res) => {
  const userData = req.body;

  userModel.create(userData)
    .then(() => {
      console.log('Data Registered');

   
      sendConfirmationEmail(userData.email, userData.name)
        .then(() => {
          res.status(201).json({ message: 'Registered Successfully' });
        })
        .catch(err => {
          console.error('Error sending email:', err);
          res.status(201).json({ message: 'Registered Successfully, but failed to send confirmation email.' });
        });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


async function sendConfirmationEmail(toEmail, name) {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS 
    }
  });

 
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Registration Confirmation',
    text: `Dear ${name},\n\nThank you for registering!\n\nWe will get back to you if your application is accepted.\n\nBest regards,\nNDLI SEC`
  };


  return transporter.sendMail(mailOptions);
}

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.listen(5000, () => {
  console.log('Server is listening on port 5000');
});
