const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/dashboard/stats - Statistiques du tableau de bord
router.get('/stats', async (req, res) => {
  try {
    // Statistiques du mois en cours
    const [monthStats] = await pool.query(`
      SELECT 
        COUNT(*) as livraisons_mois,
        COALESCE(SUM(prix_ttc), 0) as revenu_mois_ttc,
        COALESCE(SUM(solde_restant), 0) as solde_restant_mois
      FROM expeditions 
      WHERE MONTH(date_expedition) = MONTH(CURRENT_DATE())
        AND YEAR(date_expedition) = YEAR(CURRENT_DATE())
    `);

    // Statistiques de la semaine en cours
    const [weekStats] = await pool.query(`
      SELECT COUNT(*) as livraisons_semaine
      FROM expeditions 
      WHERE YEARWEEK(date_expedition, 1) = YEARWEEK(CURRENT_DATE(), 1)
    `);

    // Statistiques de l'année
    const [yearStats] = await pool.query(`
      SELECT 
        COALESCE(SUM(prix_ttc), 0) as revenu_annee_ttc,
        COUNT(*) as livraisons_annee
      FROM expeditions 
      WHERE YEAR(date_expedition) = YEAR(CURRENT_DATE())
    `);

    // Solde total restant dû (toutes périodes)
    const [totalSolde] = await pool.query(`
      SELECT COALESCE(SUM(solde_restant), 0) as solde_total_restant
      FROM expeditions 
      WHERE solde_restant > 0
    `);

    // 5 livraisons "En Transit" les plus anciennes
    const [enTransit] = await pool.query(`
      SELECT e.*, c.nom_entite
      FROM expeditions e
      JOIN clients c ON e.client_id = c.id
      WHERE e.statut_livraison = 'En Transit'
      ORDER BY e.date_expedition ASC
      LIMIT 5
    `);

    // Nombre d'alertes de paiement
    const [alertes] = await pool.query(`
      SELECT COUNT(*) as nombre_alertes
      FROM expeditions 
      WHERE solde_restant > 0 AND statut_livraison = 'Livré'
    `);

    // Nombre total de clients
    const [clients] = await pool.query(`
      SELECT COUNT(*) as total_clients
      FROM clients WHERE actif = TRUE
    `);

    // Répartition par statut de livraison (mois en cours)
    const [statutsLivraison] = await pool.query(`
      SELECT statut_livraison, COUNT(*) as nombre
      FROM expeditions 
      WHERE MONTH(date_expedition) = MONTH(CURRENT_DATE())
        AND YEAR(date_expedition) = YEAR(CURRENT_DATE())
      GROUP BY statut_livraison
    `);

    // Répartition par statut de paiement (mois en cours)
    const [statutsPaiement] = await pool.query(`
      SELECT statut_paiement, COUNT(*) as nombre
      FROM expeditions 
      WHERE MONTH(date_expedition) = MONTH(CURRENT_DATE())
        AND YEAR(date_expedition) = YEAR(CURRENT_DATE())
      GROUP BY statut_paiement
    `);

    res.json({
      success: true,
      data: {
        mois: {
          livraisons: monthStats[0].livraisons_mois,
          revenu_ttc: parseFloat(monthStats[0].revenu_mois_ttc),
          solde_restant: parseFloat(monthStats[0].solde_restant_mois)
        },
        semaine: {
          livraisons: weekStats[0].livraisons_semaine
        },
        annee: {
          livraisons: yearStats[0].livraisons_annee,
          revenu_ttc: parseFloat(yearStats[0].revenu_annee_ttc)
        },
        solde_total_restant: parseFloat(totalSolde[0].solde_total_restant),
        livraisons_en_transit: enTransit,
        nombre_alertes: alertes[0].nombre_alertes,
        total_clients: clients[0].total_clients,
        repartition_livraison: statutsLivraison,
        repartition_paiement: statutsPaiement
      }
    });

  } catch (error) {
    console.error('Erreur statistiques dashboard:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dashboard/evolution - Évolution mensuelle
router.get('/evolution', async (req, res) => {
  try {
    const [evolution] = await pool.query(`
      SELECT 
        YEAR(date_expedition) as annee,
        MONTH(date_expedition) as mois,
        COUNT(*) as nombre_livraisons,
        COALESCE(SUM(prix_ttc), 0) as revenu_ttc,
        COALESCE(SUM(montant_paye), 0) as montant_paye
      FROM expeditions
      WHERE date_expedition >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(date_expedition), MONTH(date_expedition)
      ORDER BY annee, mois
    `);

    res.json({ success: true, data: evolution });
  } catch (error) {
    console.error('Erreur évolution:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;

