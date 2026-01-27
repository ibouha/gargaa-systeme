-- =====================================================
-- GARGAA TRANSPORT - Système de Gestion des Frais
-- Migration: Ajout des tables pour la gestion des dépenses
-- =====================================================

USE gargaa_transport;

-- =====================================================
-- Table des Catégories de Frais
-- =====================================================
CREATE TABLE categories_frais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    type_categorie ENUM('Magasin', 'Camion', 'Autre') NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type_categorie (type_categorie),
    INDEX idx_actif (actif)
) ENGINE=InnoDB;

-- =====================================================
-- Table des Frais/Dépenses
-- =====================================================
CREATE TABLE frais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT NOT NULL,
    numero_camion VARCHAR(50),  -- NULL pour les frais non-camion
    montant DECIMAL(12, 2) NOT NULL,
    date_frais DATE NOT NULL,
    description TEXT,
    reference_facture VARCHAR(100),  -- Référence facture/reçu
    mode_paiement ENUM('Espèces', 'Chèque', 'Virement', 'Carte') DEFAULT 'Espèces',
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categorie_id) REFERENCES categories_frais(id) ON DELETE RESTRICT,
    
    INDEX idx_categorie (categorie_id),
    INDEX idx_date (date_frais),
    INDEX idx_numero_camion (numero_camion),
    INDEX idx_mode_paiement (mode_paiement)
) ENGINE=InnoDB;

-- =====================================================
-- Insertion des catégories par défaut
-- =====================================================

-- Catégories Magasin
INSERT INTO categories_frais (nom, type_categorie, description) VALUES
('WiFi/Internet', 'Magasin', 'Frais d\'abonnement internet et WiFi'),
('Électricité', 'Magasin', 'Factures d\'électricité du magasin'),
('Eau', 'Magasin', 'Factures d\'eau'),
('Salaires Personnel', 'Magasin', 'Salaires du personnel administratif'),
('Bouteille de Gaz', 'Magasin', 'Achat de bouteilles de gaz'),
('Extincteur', 'Magasin', 'Achat et maintenance des extincteurs'),
('Loyer', 'Magasin', 'Loyer du local/magasin'),
('Fournitures Bureau', 'Magasin', 'Fournitures et matériel de bureau'),
('Téléphone', 'Magasin', 'Frais de téléphonie'),
('Nettoyage', 'Magasin', 'Frais de nettoyage et entretien du local');

-- Catégories Camion
INSERT INTO categories_frais (nom, type_categorie, description) VALUES
('Gasoil/Carburant', 'Camion', 'Achat de carburant pour les camions'),
('Entretien Mécanique', 'Camion', 'Réparations et entretien mécanique'),
('Salaire Chauffeur', 'Camion', 'Salaires des chauffeurs'),
('Vidange', 'Camion', 'Changement d\'huile et vidange'),
('Pneus', 'Camion', 'Achat et réparation des pneus'),
('Assurance Véhicule', 'Camion', 'Primes d\'assurance des camions'),
('Vignette', 'Camion', 'Vignette et taxes véhicule'),
('Contrôle Technique', 'Camion', 'Frais de contrôle technique'),
('Pièces de Rechange', 'Camion', 'Achat de pièces détachées'),
('Lavage Camion', 'Camion', 'Nettoyage et lavage des véhicules');

-- Catégories Autres
INSERT INTO categories_frais (nom, type_categorie, description) VALUES
('Frais Bancaires', 'Autre', 'Frais de gestion bancaire'),
('Taxes et Impôts', 'Autre', 'Taxes professionnelles et impôts'),
('Assurance Professionnelle', 'Autre', 'Assurances diverses'),
('Formation', 'Autre', 'Formation du personnel'),
('Marketing/Publicité', 'Autre', 'Frais de publicité et marketing'),
('Frais Juridiques', 'Autre', 'Honoraires avocat et frais juridiques'),
('Déplacements', 'Autre', 'Frais de déplacement et missions'),
('Divers', 'Autre', 'Autres dépenses diverses');

-- =====================================================
-- Vue pour les statistiques de frais par catégorie
-- =====================================================
CREATE VIEW v_frais_par_categorie AS
SELECT 
    c.id AS categorie_id,
    c.nom AS categorie_nom,
    c.type_categorie,
    COUNT(f.id) AS nombre_frais,
    COALESCE(SUM(f.montant), 0) AS montant_total,
    YEAR(f.date_frais) AS annee,
    MONTH(f.date_frais) AS mois
FROM categories_frais c
LEFT JOIN frais f ON c.id = f.categorie_id
GROUP BY c.id, c.nom, c.type_categorie, YEAR(f.date_frais), MONTH(f.date_frais);

-- =====================================================
-- Vue pour les frais par camion
-- =====================================================
CREATE VIEW v_frais_par_camion AS
SELECT 
    f.numero_camion,
    COUNT(f.id) AS nombre_frais,
    SUM(f.montant) AS montant_total,
    YEAR(f.date_frais) AS annee,
    MONTH(f.date_frais) AS mois
FROM frais f
WHERE f.numero_camion IS NOT NULL
GROUP BY f.numero_camion, YEAR(f.date_frais), MONTH(f.date_frais);

