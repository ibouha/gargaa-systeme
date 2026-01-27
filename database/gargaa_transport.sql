-- =====================================================
-- GARGAA TRANSPORT - Système de Gestion
-- Base de données MySQL
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS gargaa_transport
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gargaa_transport;

-- =====================================================
-- Table des Utilisateurs (Authentification)
-- =====================================================
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'operateur') DEFAULT 'operateur',
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL
) ENGINE=InnoDB;

-- =====================================================
-- Table des Clients (Répertoire)
-- =====================================================
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_client ENUM('Entreprise', 'Particulier') NOT NULL,
    nom_entite VARCHAR(150) NOT NULL,
    numero_telephone VARCHAR(20) NOT NULL,
    adresse_complete TEXT NOT NULL,
    email VARCHAR(100),
    notes TEXT,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    
    INDEX idx_nom_entite (nom_entite),
    INDEX idx_telephone (numero_telephone),
    INDEX idx_type_client (type_client)
) ENGINE=InnoDB;

-- =====================================================
-- Table des Expéditions (Suivi des Livraisons)
-- =====================================================
CREATE TABLE expeditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    numero_expedition VARCHAR(50) NOT NULL UNIQUE,
    
    -- Logistique & Dates
    date_expedition DATE NOT NULL,
    type_marchandises VARCHAR(100),
    ville_depart VARCHAR(100) NOT NULL,
    ville_arrivee VARCHAR(100) NOT NULL,
    
    -- Transport & Chauffeur
    type_camion VARCHAR(50),
    numero_camion VARCHAR(50),
    nom_chauffeur VARCHAR(100),
    telephone_chauffeur VARCHAR(20),
    
    -- Détails Financiers
    prix_ht DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    taux_tva DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    montant_taxe DECIMAL(12, 2) GENERATED ALWAYS AS (prix_ht * taux_tva / 100) STORED,
    prix_ttc DECIMAL(12, 2) GENERATED ALWAYS AS (prix_ht + (prix_ht * taux_tva / 100)) STORED,
    
    -- Statut & Paiement
    statut_paiement ENUM('Payé', 'Non Payé', 'Incomplet') DEFAULT 'Non Payé',
    montant_paye DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    solde_restant DECIMAL(12, 2) GENERATED ALWAYS AS (
        (prix_ht + (prix_ht * taux_tva / 100)) - montant_paye
    ) STORED,
    
    -- Statut de Livraison
    statut_livraison ENUM('En attente de collecte', 'En Transit', 'Livré', 'Annulé') 
        DEFAULT 'En attente de collecte',
    
    -- Métadonnées
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    
    INDEX idx_client (client_id),
    INDEX idx_date_expedition (date_expedition),
    INDEX idx_statut_paiement (statut_paiement),
    INDEX idx_statut_livraison (statut_livraison),
    INDEX idx_numero_expedition (numero_expedition)
) ENGINE=InnoDB;

-- =====================================================
-- Vue pour les alertes de paiement en retard
-- =====================================================
CREATE VIEW v_alertes_paiement AS
SELECT 
    e.*,
    c.nom_entite,
    c.numero_telephone AS telephone_client
FROM expeditions e
JOIN clients c ON e.client_id = c.id
WHERE e.solde_restant > 0 
  AND e.statut_livraison = 'Livré';

-- =====================================================
-- Vue pour le tableau de bord récapitulatif
-- =====================================================
CREATE VIEW v_statistiques_mensuelles AS
SELECT 
    YEAR(date_expedition) AS annee,
    MONTH(date_expedition) AS mois,
    COUNT(*) AS nombre_livraisons,
    SUM(prix_ttc) AS revenu_total_ttc,
    SUM(solde_restant) AS solde_total_restant,
    SUM(CASE WHEN statut_livraison = 'Livré' THEN 1 ELSE 0 END) AS livraisons_terminees,
    SUM(CASE WHEN statut_paiement = 'Payé' THEN 1 ELSE 0 END) AS paiements_complets
FROM expeditions
GROUP BY YEAR(date_expedition), MONTH(date_expedition);

-- =====================================================
-- Insertion d'un utilisateur admin par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
-- =====================================================
INSERT INTO utilisateurs (nom_utilisateur, mot_de_passe, nom_complet, email, role)
VALUES ('admin', '$2b$10$VqVY0nS.s6./ORAfYwe64OyLHRRTLQogdeVNzNOeenPtGJBE9Ea5K',
        'Administrateur', 'admin@gargaa.com', 'admin');

-- =====================================================
-- Données de test (optionnel)
-- =====================================================
INSERT INTO clients (type_client, nom_entite, numero_telephone, adresse_complete) VALUES
('Entreprise', 'SARL TechnoPlus', '+213 555 123 456', '15 Rue de la Liberté, Alger, Algérie'),
('Particulier', 'Mohamed Benali', '+213 555 789 012', '23 Avenue du 1er Novembre, Oran, Algérie'),
('Entreprise', 'ETS Commerce International', '+213 555 345 678', '8 Boulevard Che Guevara, Constantine');

