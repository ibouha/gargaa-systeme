const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
require('dotenv').config();

// POST /api/auth/login - Connexion utilisateur
router.post('/login', [
  body('nom_utilisateur').notEmpty().withMessage('Le nom d\'utilisateur est requis'),
  body('mot_de_passe').notEmpty().withMessage('Le mot de passe est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nom_utilisateur, mot_de_passe } = req.body;

    // Rechercher l'utilisateur
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE nom_utilisateur = ? AND actif = TRUE',
      [nom_utilisateur]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nom d\'utilisateur ou mot de passe incorrect.' 
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nom d\'utilisateur ou mot de passe incorrect.' 
      });
    }

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = ?',
      [user.id]
    );

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        nom_utilisateur: user.nom_utilisateur, 
        nom_complet: user.nom_complet,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        nom_complet: user.nom_complet,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la connexion.' 
    });
  }
});

// POST /api/auth/register - Créer un nouvel utilisateur (admin uniquement)
router.post('/register', [
  body('nom_utilisateur').isLength({ min: 3 }).withMessage('Min 3 caractères'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Min 6 caractères'),
  body('nom_complet').notEmpty().withMessage('Le nom complet est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nom_utilisateur, mot_de_passe, nom_complet, email, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const [existing] = await pool.query(
      'SELECT id FROM utilisateurs WHERE nom_utilisateur = ?',
      [nom_utilisateur]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce nom d\'utilisateur existe déjà.' 
      });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Insérer le nouvel utilisateur
    const [result] = await pool.query(
      `INSERT INTO utilisateurs (nom_utilisateur, mot_de_passe, nom_complet, email, role)
       VALUES (?, ?, ?, ?, ?)`,
      [nom_utilisateur, hashedPassword, nom_complet, email || null, role || 'operateur']
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'inscription.' 
    });
  }
});

module.exports = router;

