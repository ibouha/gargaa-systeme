const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication
router.use(authenticateToken);

// GET /api/chauffeurs - List chauffeurs
router.get('/', async (req, res) => {
  try {
    const { search, actif = 'true' } = req.query;
    let query = 'SELECT * FROM chauffeurs WHERE 1=1';
    const params = [];

    if (actif === 'true') {
      query += ' AND actif = TRUE';
    }

    if (search) {
      query += ' AND (nom_complet LIKE ? OR telephone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY date_ajout DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching chauffeurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/chauffeurs/:id - Get single chauffeur
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM chauffeurs WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chauffeur non trouvé' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching chauffeur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/chauffeurs - Create chauffeur
router.post('/', [
  body('nom_complet').notEmpty().withMessage('Le nom est requis'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nom_complet, telephone, adresse, permis } = req.body;

    const [result] = await pool.query(
      'INSERT INTO chauffeurs (nom_complet, telephone, adresse, permis) VALUES (?, ?, ?, ?)',
      [nom_complet, telephone, adresse, permis]
    );

    res.status(201).json({
      success: true,
      message: 'Chauffeur créé avec succès',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating chauffeur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/chauffeurs/:id - Update chauffeur
router.put('/:id', async (req, res) => {
  try {
    const { nom_complet, telephone, adresse, permis } = req.body;

    const [result] = await pool.query(
      `UPDATE chauffeurs SET 
        nom_complet = COALESCE(?, nom_complet),
        telephone = COALESCE(?, telephone),
        adresse = COALESCE(?, adresse),
        permis = COALESCE(?, permis)
       WHERE id = ?`,
      [nom_complet, telephone, adresse, permis, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Chauffeur non trouvé' });
    }

    res.json({ success: true, message: 'Chauffeur mis à jour avec succès' });
  } catch (error) {
    console.error('Error updating chauffeur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/chauffeurs/:id - Soft delete chauffeur
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE chauffeurs SET actif = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Chauffeur non trouvé' });
    }

    res.json({ success: true, message: 'Chauffeur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting chauffeur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
