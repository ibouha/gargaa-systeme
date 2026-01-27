const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// GET /api/devis - Get all devis
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT d.*, c.nom_entite 
      FROM devis d 
      JOIN clients c ON d.client_id = c.id 
      ORDER BY d.date_devis DESC, d.created_at DESC
    `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erreur récupération devis:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/devis/next-number - Get next devis number
router.get('/next-number', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // Get the latest devis number for the current year
        const [latestDevis] = await pool.query(
            `SELECT numero_devis FROM devis 
             WHERE numero_devis LIKE ? 
             ORDER BY numero_devis DESC 
             LIMIT 1`,
            [`%-${currentYear}`]
        );

        let nextNumber = 1;
        if (latestDevis.length > 0) {
            // Extract the number part from "XXX-YYYY"
            const parts = latestDevis[0].numero_devis.split('-');
            if (parts.length > 0) {
                const lastNumber = parseInt(parts[0]);
                if (!isNaN(lastNumber)) {
                    nextNumber = lastNumber + 1;
                }
            }
        }

        // Format as XXX-YYYY (e.g., 001-2026, 002-2026)
        const nextNumeroByFormat = `${String(nextNumber).padStart(3, '0')}-${currentYear}`;

        res.json({ success: true, nextNumero: nextNumeroByFormat });
    } catch (error) {
        console.error('Erreur récupération prochain numéro devis:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/devis/:id - Get devis by id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM devis WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Erreur récupération devis:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});



// POST /api/devis - Create devis
router.post('/', async (req, res) => {
    try {
        const {
            client_id, numero_devis, date_devis, ville_depart, ville_arrivee,
            type_marchandises, prix_ht, taux_tva, prix_ttc, notes, statut
        } = req.body;

        let finalNumeroDevis = numero_devis;

        // Auto-generate numero_devis only if not provided
        if (!finalNumeroDevis || finalNumeroDevis.trim() === '') {
            const currentYear = new Date().getFullYear();

            // Get the latest devis number for the current year
            const [latestDevis] = await pool.query(
                `SELECT numero_devis FROM devis 
                 WHERE numero_devis LIKE ? 
                 ORDER BY numero_devis DESC 
                 LIMIT 1`,
                [`%-${currentYear}`]
            );

            let nextNumber = 1;
            if (latestDevis.length > 0) {
                // Extract the number part from "XXX-YYYY"
                const lastNumber = parseInt(latestDevis[0].numero_devis.split('-')[0]);
                nextNumber = lastNumber + 1;
            }

            // Format as XXX-YYYY (e.g., 001-2026, 002-2026)
            finalNumeroDevis = `${String(nextNumber).padStart(3, '0')}-${currentYear}`;
        }

        const [result] = await pool.query(
            `INSERT INTO devis (
        client_id, numero_devis, date_devis, ville_depart, ville_arrivee,
        type_marchandises, prix_ht, taux_tva, prix_ttc, notes, statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                client_id, finalNumeroDevis, date_devis, ville_depart, ville_arrivee,
                type_marchandises, prix_ht, taux_tva, prix_ttc, notes, statut || 'En attente'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Devis créé avec succès',
            data: { id: result.insertId, numero_devis: finalNumeroDevis }
        });
    } catch (error) {
        console.error('Erreur création devis:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// PUT /api/devis/:id - Update devis
router.put('/:id', async (req, res) => {
    try {
        const {
            client_id, numero_devis, date_devis, ville_depart, ville_arrivee,
            type_marchandises, prix_ht, taux_tva, prix_ttc, notes, statut
        } = req.body;

        await pool.query(
            `UPDATE devis SET 
        client_id = ?, numero_devis = ?, date_devis = ?, ville_depart = ?, ville_arrivee = ?,
        type_marchandises = ?, prix_ht = ?, taux_tva = ?, prix_ttc = ?, notes = ?, statut = ?
      WHERE id = ?`,
            [
                client_id, numero_devis, date_devis, ville_depart, ville_arrivee,
                type_marchandises, prix_ht, taux_tva, prix_ttc, notes, statut,
                req.params.id
            ]
        );

        res.json({ success: true, message: 'Devis mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur mise à jour devis:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// DELETE /api/devis/:id - Delete devis
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM devis WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }

        res.json({ success: true, message: 'Devis supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression devis:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
