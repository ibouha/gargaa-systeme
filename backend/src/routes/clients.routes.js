const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// GET /api/clients - Liste des clients avec recherche et pagination
router.get('/', async (req, res) => {
  try {
    const { search, type_client, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE actif = TRUE';
    const params = [];

    if (search) {
      whereClause += ' AND (nom_entite LIKE ? OR numero_telephone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type_client) {
      whereClause += ' AND type_client = ?';
      params.push(type_client);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM clients ${whereClause}`,
      params
    );

    // Récupérer les clients
    const [clients] = await pool.query(
      `SELECT * FROM clients ${whereClause} 
       ORDER BY date_ajout DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: clients,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération clients:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/clients/:id - Détail d'un client
router.get('/:id', async (req, res) => {
  try {
    const [clients] = await pool.query(
      'SELECT * FROM clients WHERE id = ? AND actif = TRUE',
      [req.params.id]
    );

    if (clients.length === 0) {
      return res.status(404).json({ success: false, message: 'Client non trouvé' });
    }

    res.json({ success: true, data: clients[0] });
  } catch (error) {
    console.error('Erreur récupération client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/clients/:id/expeditions - Historique des expéditions d'un client
router.get('/:id/expeditions', async (req, res) => {
  try {
    const [expeditions] = await pool.query(
      `SELECT * FROM expeditions WHERE client_id = ? ORDER BY date_expedition DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: expeditions });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/clients - Créer un nouveau client
router.post('/', [
  body('type_client').isIn(['Entreprise', 'Particulier']).withMessage('Type invalide'),
  body('nom_entite').notEmpty().withMessage('Le nom est requis'),
  body('numero_telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('adresse_complete').notEmpty().withMessage('L\'adresse est requise')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { type_client, nom_entite, numero_telephone, adresse_complete, email, ice, notes } = req.body;

    const [result] = await pool.query(
      `INSERT INTO clients (type_client, nom_entite, numero_telephone, adresse_complete, email, ice, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type_client, nom_entite, numero_telephone, adresse_complete, email || null, ice || null, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/clients/:id - Modifier un client
router.put('/:id', async (req, res) => {
  try {
    const { type_client, nom_entite, numero_telephone, adresse_complete, email, ice, notes } = req.body;

    const [result] = await pool.query(
      `UPDATE clients SET 
        type_client = COALESCE(?, type_client),
        nom_entite = COALESCE(?, nom_entite),
        numero_telephone = COALESCE(?, numero_telephone),
        adresse_complete = COALESCE(?, adresse_complete),
        email = ?,
        ice = ?,
        notes = ?
       WHERE id = ? AND actif = TRUE`,
      [type_client, nom_entite, numero_telephone, adresse_complete, email, ice, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Client non trouvé' });
    }

    res.json({ success: true, message: 'Client modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/clients/:id - Désactiver un client (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE clients SET actif = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Client non trouvé' });
    }

    res.json({ success: true, message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression client:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;

