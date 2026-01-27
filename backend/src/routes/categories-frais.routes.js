const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// GET /api/categories-frais - Liste des catégories
router.get('/', async (req, res) => {
  try {
    const { type_categorie } = req.query;
    
    let whereClause = 'WHERE actif = TRUE';
    const params = [];

    if (type_categorie && ['Magasin', 'Camion', 'Autre'].includes(type_categorie)) {
      whereClause += ' AND type_categorie = ?';
      params.push(type_categorie);
    }

    const [categories] = await pool.query(
      `SELECT * FROM categories_frais ${whereClause} ORDER BY type_categorie, nom`,
      params
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/categories-frais/:id - Détail d'une catégorie
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories_frais WHERE id = ? AND actif = TRUE',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.json({ success: true, data: categories[0] });
  } catch (error) {
    console.error('Erreur récupération catégorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/categories-frais - Créer une nouvelle catégorie
router.post('/', [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('type_categorie').isIn(['Magasin', 'Camion', 'Autre']).withMessage('Type invalide'),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nom, type_categorie, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO categories_frais (nom, type_categorie, description) VALUES (?, ?, ?)`,
      [nom, type_categorie, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/categories-frais/:id - Modifier une catégorie
router.put('/:id', async (req, res) => {
  try {
    const { nom, type_categorie, description } = req.body;

    const [result] = await pool.query(
      `UPDATE categories_frais SET 
        nom = COALESCE(?, nom),
        type_categorie = COALESCE(?, type_categorie),
        description = ?
       WHERE id = ? AND actif = TRUE`,
      [nom, type_categorie, description, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.json({ success: true, message: 'Catégorie modifiée avec succès' });
  } catch (error) {
    console.error('Erreur modification catégorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/categories-frais/:id - Désactiver une catégorie (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier s'il y a des frais associés
    const [frais] = await pool.query(
      'SELECT COUNT(*) as count FROM frais WHERE categorie_id = ?',
      [req.params.id]
    );

    if (frais[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de supprimer: des frais sont associés à cette catégorie' 
      });
    }

    const [result] = await pool.query(
      'UPDATE categories_frais SET actif = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    res.json({ success: true, message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
