const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/frais - Liste des frais avec filtres
router.get('/', async (req, res) => {
  try {
    const { 
      date_debut, date_fin, categorie_id, type_categorie, 
      numero_camion, mode_paiement, page = 1, limit = 20 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date_debut) {
      whereClause += ' AND f.date_frais >= ?';
      params.push(date_debut);
    }
    if (date_fin) {
      whereClause += ' AND f.date_frais <= ?';
      params.push(date_fin);
    }
    if (categorie_id) {
      whereClause += ' AND f.categorie_id = ?';
      params.push(categorie_id);
    }
    if (type_categorie && ['Magasin', 'Camion', 'Autre'].includes(type_categorie)) {
      whereClause += ' AND c.type_categorie = ?';
      params.push(type_categorie);
    }
    if (numero_camion) {
      whereClause += ' AND f.numero_camion LIKE ?';
      params.push(`%${numero_camion}%`);
    }
    if (mode_paiement) {
      whereClause += ' AND f.mode_paiement = ?';
      params.push(mode_paiement);
    }

    // Compter le total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM frais f 
       JOIN categories_frais c ON f.categorie_id = c.id ${whereClause}`,
      params
    );

    // Récupérer les frais
    const [frais] = await pool.query(
      `SELECT f.*, c.nom as categorie_nom, c.type_categorie
       FROM frais f 
       JOIN categories_frais c ON f.categorie_id = c.id 
       ${whereClause}
       ORDER BY f.date_frais DESC, f.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: frais,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération frais:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/frais/stats - Statistiques des frais
router.get('/stats', async (req, res) => {
  try {
    const { date_debut, date_fin, type_categorie } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date_debut) {
      whereClause += ' AND f.date_frais >= ?';
      params.push(date_debut);
    }
    if (date_fin) {
      whereClause += ' AND f.date_frais <= ?';
      params.push(date_fin);
    }
    if (type_categorie && ['Magasin', 'Camion', 'Autre'].includes(type_categorie)) {
      whereClause += ' AND c.type_categorie = ?';
      params.push(type_categorie);
    }

    // Total global
    const [totalResult] = await pool.query(
      `SELECT COALESCE(SUM(f.montant), 0) as montant_total, COUNT(f.id) as nombre_frais
       FROM frais f
       JOIN categories_frais c ON f.categorie_id = c.id ${whereClause}`,
      params
    );

    // Total par type
    const [parType] = await pool.query(
      `SELECT c.type_categorie, COALESCE(SUM(f.montant), 0) as montant_total, COUNT(f.id) as nombre_frais
       FROM frais f
       JOIN categories_frais c ON f.categorie_id = c.id ${whereClause}
       GROUP BY c.type_categorie`,
      params
    );

    // Total par catégorie
    const [parCategorie] = await pool.query(
      `SELECT c.nom as categorie_nom, c.type_categorie, COALESCE(SUM(f.montant), 0) as montant_total, COUNT(f.id) as nombre_frais
       FROM frais f
       JOIN categories_frais c ON f.categorie_id = c.id ${whereClause}
       GROUP BY c.id, c.nom, c.type_categorie
       ORDER BY montant_total DESC
       LIMIT 10`,
      params
    );

    // Évolution mensuelle
    const [evolution] = await pool.query(
      `SELECT 
         YEAR(f.date_frais) as annee,
         MONTH(f.date_frais) as mois,
         COALESCE(SUM(f.montant), 0) as montant_total,
         COUNT(f.id) as nombre_frais
       FROM frais f
       JOIN categories_frais c ON f.categorie_id = c.id ${whereClause}
       GROUP BY YEAR(f.date_frais), MONTH(f.date_frais)
       ORDER BY annee DESC, mois DESC
       LIMIT 12`,
      params
    );

    res.json({
      success: true,
      data: {
        total: totalResult[0],
        parType: parType,
        parCategorie: parCategorie,
        evolution: evolution
      }
    });
  } catch (error) {
    console.error('Erreur statistiques frais:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/frais/:id - Détail d'un frais
router.get('/:id', async (req, res) => {
  try {
    const [frais] = await pool.query(
      `SELECT f.*, c.nom as categorie_nom, c.type_categorie
       FROM frais f 
       JOIN categories_frais c ON f.categorie_id = c.id 
       WHERE f.id = ?`,
      [req.params.id]
    );

    if (frais.length === 0) {
      return res.status(404).json({ success: false, message: 'Frais non trouvé' });
    }

    res.json({ success: true, data: frais[0] });
  } catch (error) {
    console.error('Erreur récupération frais:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/frais - Créer un nouveau frais
router.post('/', [
  body('categorie_id').isInt().withMessage('Catégorie requise'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('date_frais').isDate().withMessage('Date invalide'),
  body('mode_paiement').optional().isIn(['Espèces', 'Chèque', 'Virement', 'Carte'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { 
      categorie_id, numero_camion, montant, date_frais, 
      description, reference_facture, mode_paiement = 'Espèces', notes 
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO frais (
        categorie_id, numero_camion, montant, date_frais,
        description, reference_facture, mode_paiement, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categorie_id, numero_camion || null, montant, date_frais,
        description || null, reference_facture || null, mode_paiement, notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Frais créé avec succès',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erreur création frais:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/frais/:id - Modifier un frais
router.put('/:id', async (req, res) => {
  try {
    const { 
      categorie_id, numero_camion, montant, date_frais,
      description, reference_facture, mode_paiement, notes 
    } = req.body;

    const [result] = await pool.query(
      `UPDATE frais SET 
        categorie_id = COALESCE(?, categorie_id),
        numero_camion = ?,
        montant = COALESCE(?, montant),
        date_frais = COALESCE(?, date_frais),
        description = ?,
        reference_facture = ?,
        mode_paiement = COALESCE(?, mode_paiement),
        notes = ?
       WHERE id = ?`,
      [
        categorie_id, numero_camion, montant, date_frais,
        description, reference_facture, mode_paiement, notes,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Frais non trouvé' });
    }

    res.json({ success: true, message: 'Frais modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification frais:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/frais/:id - Supprimer un frais
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM frais WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Frais non trouvé' });
    }

    res.json({ success: true, message: 'Frais supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression frais:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
