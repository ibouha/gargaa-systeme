// Extension des routes expéditions - PUT et DELETE
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// PUT /api/expeditions/:id - Modifier
router.put('/:id', async (req, res) => {
  try {
    const { 
      date_expedition, type_marchandises, ville_depart, ville_arrivee,
      type_camion, numero_camion, nom_chauffeur, telephone_chauffeur,
      prix_ht, taux_tva, statut_paiement, montant_paye, statut_livraison, notes
    } = req.body;

    const [result] = await pool.query(
      `UPDATE expeditions SET 
        date_expedition = COALESCE(?, date_expedition),
        type_marchandises = COALESCE(?, type_marchandises),
        ville_depart = COALESCE(?, ville_depart),
        ville_arrivee = COALESCE(?, ville_arrivee),
        type_camion = COALESCE(?, type_camion),
        numero_camion = COALESCE(?, numero_camion),
        nom_chauffeur = COALESCE(?, nom_chauffeur),
        telephone_chauffeur = COALESCE(?, telephone_chauffeur),
        prix_ht = COALESCE(?, prix_ht),
        taux_tva = COALESCE(?, taux_tva),
        statut_paiement = COALESCE(?, statut_paiement),
        montant_paye = COALESCE(?, montant_paye),
        statut_livraison = COALESCE(?, statut_livraison),
        notes = ?
       WHERE id = ?`,
      [date_expedition, type_marchandises, ville_depart, ville_arrivee,
       type_camion, numero_camion, nom_chauffeur, telephone_chauffeur,
       prix_ht, taux_tva, statut_paiement, montant_paye, statut_livraison, 
       notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Expédition non trouvée' });
    }

    res.json({ success: true, message: 'Expédition modifiée avec succès' });
  } catch (error) {
    console.error('Erreur modification expédition:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/expeditions/:id - Supprimer
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM expeditions WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Expédition non trouvée' });
    }

    res.json({ success: true, message: 'Expédition supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression expédition:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;

