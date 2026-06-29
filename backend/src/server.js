import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

// Nhập các module tự viết (Nhớ thêm đuôi .js)
import connectDB from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Cấu hình lại __dirname cho môi trường ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB();

// ---- CORS ----
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // Cho phép tools (Postman, curl) không có origin
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: ' + origin));
  },
  credentials: false
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Static assets (payment logos, etc.)
app.use('/public', express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d' }));

app.get('/', (_req, res) => res.json({ ok: true, name: 'auth-api', version: '2.0.0' }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// Sử dụng các routes đã import ở trên
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);

// 404
app.use((req, res) => res.status(404).json({ ok: false, message: 'Not found' }));

// Error handler.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running: http://localhost:${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});