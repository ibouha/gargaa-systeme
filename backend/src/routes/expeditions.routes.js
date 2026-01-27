const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/expeditions - Liste avec filtres
router.get('/', async (req, res) => {
  try {
    const {
      client_id, date_debut, date_fin, statut_paiement,
      statut_livraison, search, page = 1, limit = 20
    } = req.query;
    const offset = (page - 1) * limit;

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
    if (search) {
      whereClause += ' AND (c.nom_entite LIKE ? OR e.numero_expedition LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM expeditions e 
       JOIN clients c ON e.client_id = c.id ${whereClause}`,
      params
    );

    const [expeditions] = await pool.query(
      `SELECT e.*, c.nom_entite, c.numero_telephone as telephone_client, c.type_client
       FROM expeditions e 
       JOIN clients c ON e.client_id = c.id 
       ${whereClause}
       ORDER BY e.date_expedition DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: expeditions,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération expéditions:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/expeditions/alertes - Alertes paiement en retard
router.get('/alertes', async (req, res) => {
  try {
    const [alertes] = await pool.query(
      `SELECT e.*, c.nom_entite, c.numero_telephone as telephone_client
       FROM expeditions e 
       JOIN clients c ON e.client_id = c.id 
       WHERE e.solde_restant > 0 AND e.statut_livraison = 'Livré'
       ORDER BY e.date_expedition ASC`
    );
    res.json({ success: true, data: alertes });
  } catch (error) {
    console.error('Erreur alertes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/expeditions/next-number - Get next expedition number
router.get('/next-number', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Get the latest expedition number for the current year
    const [latestExpedition] = await pool.query(
      `SELECT numero_expedition FROM expeditions 
       WHERE numero_expedition LIKE ? 
       ORDER BY numero_expedition DESC 
       LIMIT 1`,
      [`%-${currentYear}`]
    );

    let nextNumber = 1;
    if (latestExpedition.length > 0) {
      // Extract the number part from "XXX-YYYY"
      const parts = latestExpedition[0].numero_expedition.split('-');
      if (parts.length > 0) {
        const lastNumber = parseInt(parts[0]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    // Format as XXX-YYYY (e.g., 001-2026)
    const nextNumeroByFormat = `${String(nextNumber).padStart(3, '0')}-${currentYear}`;

    res.json({ success: true, nextNumero: nextNumeroByFormat });
  } catch (error) {
    console.error('Erreur récupération prochain numéro expédition:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/expeditions/:id - Détail
router.get('/:id', async (req, res) => {
  try {
    const [expeditions] = await pool.query(
      `SELECT e.*, c.nom_entite, c.numero_telephone as telephone_client, 
              c.adresse_complete as adresse_client, c.type_client
       FROM expeditions e 
       JOIN clients c ON e.client_id = c.id 
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (expeditions.length === 0) {
      return res.status(404).json({ success: false, message: 'Expédition non trouvée' });
    }

    res.json({ success: true, data: expeditions[0] });
  } catch (error) {
    console.error('Erreur récupération expédition:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/expeditions - Créer
router.post('/', [
  body('client_id').isInt().withMessage('Client requis'),
  body('date_expedition').isDate().withMessage('Date invalide'),
  body('ville_depart').notEmpty().withMessage('Ville de départ requise'),
  body('ville_arrivee').notEmpty().withMessage('Ville d\'arrivée requise'),
  body('prix_ht').isFloat({ min: 0 }).withMessage('Prix HT invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      client_id, numero_expedition, date_expedition, type_marchandises,
      ville_depart, ville_arrivee, type_camion, numero_camion,
      nom_chauffeur, telephone_chauffeur, prix_ht, taux_tva = 10,
      statut_paiement = 'Non Payé', montant_paye = 0,
      statut_livraison = 'En attente de collecte', notes
    } = req.body;

    let finalNumeroExpedition = numero_expedition;

    // Auto-generate numero_expedition only if not provided
    if (!finalNumeroExpedition || finalNumeroExpedition.trim() === '') {
      const currentYear = new Date().getFullYear();

      // Get the latest expedition number for the current year
      const [latestExpedition] = await pool.query(
        `SELECT numero_expedition FROM expeditions 
         WHERE numero_expedition LIKE ? 
         ORDER BY numero_expedition DESC 
         LIMIT 1`,
        [`%-${currentYear}`]
      );

      let nextNumber = 1;
      if (latestExpedition.length > 0) {
        // Extract the number part from "XXX-YYYY"
        const lastNumber = parseInt(latestExpedition[0].numero_expedition.split('-')[0]);
        nextNumber = lastNumber + 1;
      }

      // Format as XXX-YYYY (e.g., 001-2026, 002-2026)
      finalNumeroExpedition = `${String(nextNumber).padStart(3, '0')}-${currentYear}`;
    }

    const [result] = await pool.query(
      `INSERT INTO expeditions (
        client_id, numero_expedition, date_expedition, type_marchandises,
        ville_depart, ville_arrivee, type_camion, numero_camion,
        nom_chauffeur, telephone_chauffeur, prix_ht, taux_tva,
        statut_paiement, montant_paye, statut_livraison, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, finalNumeroExpedition, date_expedition, type_marchandises,
        ville_depart, ville_arrivee, type_camion, numero_camion,
        nom_chauffeur, telephone_chauffeur, prix_ht, taux_tva,
        statut_paiement, montant_paye, statut_livraison, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Expédition créée avec succès',
      data: { id: result.insertId, numero_expedition: finalNumeroExpedition }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro d\'expédition existe déjà'
      });
    }
    console.error('Erreur création expédition:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;

