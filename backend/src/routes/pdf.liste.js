// Extension PDF - Export liste filtrée
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// POST /api/pdf/liste - Exporter liste filtrée en PDF
router.post('/liste', async (req, res) => {
  try {
    const { client_id, date_debut, date_fin, statut_paiement, statut_livraison } = req.body;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (client_id) {
      whereClause += ' AND e.client_id = ?';
      params.push(client_id);
    }
    if (date_debut) {
      whereClause += ' AND e.date_expedition >= ?';
      params.push(date_debut);
    }
    if (date_fin) {
      whereClause += ' AND e.date_expedition <= ?';
      params.push(date_fin);
    }
    if (statut_paiement) {
      whereClause += ' AND e.statut_paiement = ?';
      params.push(statut_paiement);
    }
    if (statut_livraison) {
      whereClause += ' AND e.statut_livraison = ?';
      params.push(statut_livraison);
    }

    const [expeditions] = await pool.query(
      `SELECT e.*, c.nom_entite
       FROM expeditions e 
       JOIN clients c ON e.client_id = c.id 
       ${whereClause}
       ORDER BY e.date_expedition DESC`,
      params
    );

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 
      `attachment; filename=liste_expeditions_${Date.now()}.pdf`);

    doc.pipe(res);

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('GARGAA TRANSPORT', { align: 'center' });
    doc.fontSize(14).text('Liste des Expéditions', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown();

    // Filtres appliqués
    if (date_debut || date_fin || statut_paiement || statut_livraison) {
      doc.fontSize(9).text('Filtres: ' + 
        (date_debut ? `Du ${date_debut} ` : '') +
        (date_fin ? `Au ${date_fin} ` : '') +
        (statut_paiement ? `| Paiement: ${statut_paiement} ` : '') +
        (statut_livraison ? `| Livraison: ${statut_livraison}` : ''));
      doc.moveDown(0.5);
    }

    // Tableau
    const headers = ['N° Exp.', 'Date', 'Client', 'Trajet', 'TTC', 'Payé', 'Solde', 'Statut'];
    const colWidths = [70, 65, 120, 150, 70, 70, 70, 100];
    let xPos = 30;
    const startY = doc.y;

    // En-têtes
    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, xPos, startY, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    doc.moveTo(30, startY + 15).lineTo(780, startY + 15).stroke();
    let yPos = startY + 20;

    // Données
    doc.font('Helvetica').fontSize(8);
    let totalTTC = 0, totalPaye = 0, totalSolde = 0;

    expeditions.forEach((exp, index) => {
      if (yPos > 520) {
        doc.addPage();
        yPos = 50;
      }

      xPos = 30;
      const row = [
        exp.numero_expedition.substring(0, 12),
        new Date(exp.date_expedition).toLocaleDateString('fr-FR'),
        exp.nom_entite.substring(0, 20),
        `${exp.ville_depart} → ${exp.ville_arrivee}`.substring(0, 25),
        `${parseFloat(exp.prix_ttc).toFixed(0)} DH`,
        `${parseFloat(exp.montant_paye).toFixed(0)} DH`,
        `${parseFloat(exp.solde_restant).toFixed(0)} DH`,
        exp.statut_paiement
      ];

      row.forEach((cell, i) => {
        doc.text(cell, xPos, yPos, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      totalTTC += parseFloat(exp.prix_ttc);
      totalPaye += parseFloat(exp.montant_paye);
      totalSolde += parseFloat(exp.solde_restant);

      yPos += 15;
    });

    // Totaux
    doc.moveTo(30, yPos).lineTo(780, yPos).stroke();
    yPos += 5;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`TOTAUX: ${expeditions.length} expéditions | TTC: ${totalTTC.toFixed(2)} DH | Payé: ${totalPaye.toFixed(2)} DH | Solde: ${totalSolde.toFixed(2)} DH`, 30, yPos);

    doc.end();

  } catch (error) {
    console.error('Erreur export PDF liste:', error);
    res.status(500).json({ success: false, message: 'Erreur génération PDF' });
  }
});

module.exports = router;

