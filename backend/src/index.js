const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const clientsRoutes = require('./routes/clients.routes');
const expeditionsRoutes = require('./routes/expeditions.routes');
const expeditionsExtended = require('./routes/expeditions.extended');
const dashboardRoutes = require('./routes/dashboard.routes');
const pdfRoutes = require('./routes/pdf.routes');
const pdfListeRoutes = require('./routes/pdf.liste');
const chauffeursRoutes = require('./routes/chauffeurs.routes');
const devisRoutes = require('./routes/devis.routes');

// Frais (Expenses)
const categoriesFraisRoutes = require('./routes/categories-frais.routes');
const fraisRoutes = require('./routes/frais.routes');
const fraisPdfRoutes = require('./routes/frais-pdf.routes');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/expeditions', expeditionsRoutes);
app.use('/api/expeditions', expeditionsExtended);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/pdf', pdfListeRoutes);
app.use('/api/chauffeurs', chauffeursRoutes);
app.use('/api/devis', devisRoutes);

// Frais routes
app.use('/api/categories-frais', categoriesFraisRoutes);
app.use('/api/frais', fraisRoutes);
app.use('/api/frais-pdf', fraisPdfRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GARGAA TRANSPORT API opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne'
  });
});

const PORT = process.env.PORT || 5000;

// Démarrage du serveur
const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║     GARGAA TRANSPORT - API Backend                ║
║     Serveur démarré sur le port ${PORT}              ║
║     http://localhost:${PORT}                         ║
╚═══════════════════════════════════════════════════╝
    `);
  });
};

startServer();

