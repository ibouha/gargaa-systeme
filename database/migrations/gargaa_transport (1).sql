-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 27 jan. 2026 à 13:08
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gargaa_transport`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories_frais`
--

CREATE TABLE `categories_frais` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type_categorie` enum('Magasin','Camion','Autre') NOT NULL,
  `description` text DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories_frais`
--

INSERT INTO `categories_frais` (`id`, `nom`, `type_categorie`, `description`, `actif`, `date_creation`) VALUES
(1, 'WiFi/Internet', 'Magasin', 'Frais d\'abonnement internet et WiFi', 1, '2026-01-06 12:05:29'),
(2, 'Électricité', 'Magasin', 'Factures d\'électricité du magasin', 1, '2026-01-06 12:05:29'),
(3, 'Eau', 'Magasin', 'Factures d\'eau', 1, '2026-01-06 12:05:29'),
(4, 'Salaires Personnel', 'Magasin', 'Salaires du personnel administratif', 1, '2026-01-06 12:05:29'),
(5, 'Bouteille de Gaz', 'Magasin', 'Achat de bouteilles de gaz', 1, '2026-01-06 12:05:29'),
(6, 'Extincteur', 'Magasin', 'Achat et maintenance des extincteurs', 1, '2026-01-06 12:05:29'),
(7, 'Loyer', 'Magasin', 'Loyer du local/magasin', 1, '2026-01-06 12:05:29'),
(8, 'Fournitures Bureau', 'Magasin', 'Fournitures et matériel de bureau', 1, '2026-01-06 12:05:29'),
(9, 'Téléphone', 'Magasin', 'Frais de téléphonie', 1, '2026-01-06 12:05:29'),
(10, 'Nettoyage', 'Magasin', 'Frais de nettoyage et entretien du local', 1, '2026-01-06 12:05:29'),
(11, 'Gasoil/Carburant', 'Camion', 'Achat de carburant pour les camions', 1, '2026-01-06 12:05:29'),
(12, 'Entretien Mécanique', 'Camion', 'Réparations et entretien mécanique', 1, '2026-01-06 12:05:29'),
(13, 'Salaire Chauffeur', 'Camion', 'Salaires des chauffeurs', 1, '2026-01-06 12:05:29'),
(14, 'Vidange', 'Camion', 'Changement d\'huile et vidange', 1, '2026-01-06 12:05:29'),
(15, 'Pneus', 'Camion', 'Achat et réparation des pneus', 1, '2026-01-06 12:05:29'),
(16, 'Assurance Véhicule', 'Camion', 'Primes d\'assurance des camions', 1, '2026-01-06 12:05:29'),
(17, 'Vignette', 'Camion', 'Vignette et taxes véhicule', 1, '2026-01-06 12:05:29'),
(18, 'Contrôle Technique', 'Camion', 'Frais de contrôle technique', 1, '2026-01-06 12:05:29'),
(19, 'Pièces de Rechange', 'Camion', 'Achat de pièces détachées', 1, '2026-01-06 12:05:29'),
(20, 'Lavage Camion', 'Camion', 'Nettoyage et lavage des véhicules', 1, '2026-01-06 12:05:29'),
(21, 'Frais Bancaires', 'Autre', 'Frais de gestion bancaire', 1, '2026-01-06 12:05:29'),
(22, 'Taxes et Impôts', 'Autre', 'Taxes professionnelles et impôts', 1, '2026-01-06 12:05:29'),
(23, 'Assurance Professionnelle', 'Autre', 'Assurances diverses', 1, '2026-01-06 12:05:29'),
(24, 'Formation', 'Autre', 'Formation du personnel', 1, '2026-01-06 12:05:29'),
(25, 'Marketing/Publicité', 'Autre', 'Frais de publicité et marketing', 1, '2026-01-06 12:05:29'),
(26, 'Frais Juridiques', 'Autre', 'Honoraires avocat et frais juridiques', 1, '2026-01-06 12:05:29'),
(27, 'Déplacements', 'Autre', 'Frais de déplacement et missions', 1, '2026-01-06 12:05:29'),
(28, 'Divers', 'Autre', 'Autres dépenses diverses', 1, '2026-01-06 12:05:29');

-- --------------------------------------------------------

--
-- Structure de la table `chauffeurs`
--

CREATE TABLE `chauffeurs` (
  `id` int(11) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `adresse` text DEFAULT NULL,
  `permis` varchar(50) DEFAULT NULL,
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp(),
  `actif` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `chauffeurs`
--

INSERT INTO `chauffeurs` (`id`, `nom_complet`, `telephone`, `adresse`, `permis`, `date_ajout`, `actif`) VALUES
(1, 'aziz ait laasri', '0680463617', '', '', '2025-12-23 12:34:36', 1),
(2, 'belaid chajai', '0608905341', 'tisalat: 0639365341', '', '2026-01-16 18:19:32', 1),
(3, 'brahim l7ya', '0610395786', '', '', '2026-01-16 18:21:44', 1);

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `type_client` enum('Entreprise','Particulier') NOT NULL,
  `nom_entite` varchar(150) NOT NULL,
  `numero_telephone` varchar(20) NOT NULL,
  `adresse_complete` text NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ice` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `actif` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `type_client`, `nom_entite`, `numero_telephone`, `adresse_complete`, `email`, `ice`, `notes`, `date_ajout`, `date_modification`, `actif`) VALUES
(6, 'Entreprise', 'Sté Sobra', '+212600112233', 'Lot Tinmel  N°313 , Ait Melloul', 'ibouhaamin@gmail.com', '003 265389 0000 20', '', '2025-12-12 15:18:24', '2025-12-15 18:53:20', 0),
(7, 'Particulier', 'souad agadir matar nouaceur', '+212661681944', 'casablanca , nouaceur', NULL, NULL, 'prix 3000dh', '2025-12-15 18:55:55', '2025-12-15 18:55:55', 1),
(8, 'Particulier', 'mustapha agadir lmatar', '+212661437490', 'agadir', '', '', 'prix :\n3500 dh et 4000 dh', '2025-12-15 18:57:25', '2025-12-15 18:57:39', 1),
(9, 'Particulier', 'brahim gargaa', '0669632715', 'lqilaa', NULL, NULL, NULL, '2026-01-16 11:54:15', '2026-01-16 15:59:52', 0),
(10, 'Entreprise', 'STE AZURA', '0661955152', 'AIT MELLOUL', NULL, '0001545285278', NULL, '2026-01-21 09:54:15', '2026-01-23 18:38:22', 0),
(11, 'Entreprise', 'STE THBS FOOD SARL ', '+212666621872', 'N° 65 Av.Ghandi D4 2ème étage Cite dakhla-AGADIR', NULL, '003366911000057', NULL, '2026-01-23 19:14:28', '2026-01-23 19:14:28', 1),
(12, 'Entreprise', 'STE SOLUTION TOITURE', '+212661431323', 'N 773 ZONE INDUSTRIELLE AIT MELLOUL', 'info.solutiontoiture@gmail.com', '003138506000023', NULL, '2026-01-24 13:13:58', '2026-01-24 13:13:58', 1),
(13, 'Entreprise', 'STOKVIS INDUSTRIES', '05 22 65 46 00', 'Zone indust Oulad Salah, lot 1711\n– Boite postale 205 – 20180\nBouskoura', NULL, '000093730000020', NULL, '2026-01-26 10:36:36', '2026-01-26 10:36:36', 1),
(14, 'Entreprise', ' STE PROBULK SARL', '+212600005522', 'MAROC', NULL, '003797565000080', NULL, '2026-01-26 10:47:35', '2026-01-26 10:47:35', 1);

-- --------------------------------------------------------

--
-- Structure de la table `devis`
--

CREATE TABLE `devis` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `numero_devis` varchar(50) NOT NULL,
  `date_devis` date NOT NULL,
  `ville_depart` varchar(100) NOT NULL,
  `ville_arrivee` varchar(100) NOT NULL,
  `type_marchandises` varchar(255) DEFAULT NULL,
  `prix_ht` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taux_tva` decimal(5,2) NOT NULL DEFAULT 20.00,
  `prix_ttc` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `statut` enum('En attente','Accepté','Refusé','Transformé') DEFAULT 'En attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `devis`
--

INSERT INTO `devis` (`id`, `client_id`, `numero_devis`, `date_devis`, `ville_depart`, `ville_arrivee`, `type_marchandises`, `prix_ht`, `taux_tva`, `prix_ttc`, `notes`, `statut`, `created_at`) VALUES
(1, 13, '001-2026', '2026-01-26', 'PORT DE CASABLANCA', 'DAKHLA', 'charge les conteneurs', 17272.73, 10.00, 19000.00, '', 'En attente', '2026-01-26 11:40:17');

-- --------------------------------------------------------

--
-- Structure de la table `expeditions`
--

CREATE TABLE `expeditions` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `numero_expedition` varchar(50) NOT NULL,
  `date_expedition` date NOT NULL,
  `type_marchandises` varchar(100) DEFAULT NULL,
  `ville_depart` varchar(100) NOT NULL,
  `ville_arrivee` varchar(100) NOT NULL,
  `type_camion` varchar(50) DEFAULT NULL,
  `numero_camion` varchar(50) DEFAULT NULL,
  `nom_chauffeur` varchar(100) DEFAULT NULL,
  `telephone_chauffeur` varchar(20) DEFAULT NULL,
  `prix_ht` decimal(12,2) NOT NULL DEFAULT 0.00,
  `taux_tva` decimal(5,2) NOT NULL DEFAULT 20.00,
  `montant_taxe` decimal(12,2) GENERATED ALWAYS AS (`prix_ht` * `taux_tva` / 100) STORED,
  `prix_ttc` decimal(12,2) GENERATED ALWAYS AS (`prix_ht` + `prix_ht` * `taux_tva` / 100) STORED,
  `statut_paiement` enum('Payé','Non Payé','Incomplet') DEFAULT 'Non Payé',
  `montant_paye` decimal(12,2) NOT NULL DEFAULT 0.00,
  `solde_restant` decimal(12,2) GENERATED ALWAYS AS (`prix_ht` + `prix_ht` * `taux_tva` / 100 - `montant_paye`) STORED,
  `statut_livraison` enum('En attente de collecte','En Transit','Livré','Annulé') DEFAULT 'En attente de collecte',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `expeditions`
--

INSERT INTO `expeditions` (`id`, `client_id`, `numero_expedition`, `date_expedition`, `type_marchandises`, `ville_depart`, `ville_arrivee`, `type_camion`, `numero_camion`, `nom_chauffeur`, `telephone_chauffeur`, `prix_ht`, `taux_tva`, `statut_paiement`, `montant_paye`, `statut_livraison`, `date_creation`, `date_modification`, `notes`) VALUES
(13, 11, '001-2026', '2026-01-19', 'TRANSPORT DE MARCHANDISES', 'AGADIR', 'RABAT', '', '', '', '', 2545.45, 10.00, 'Non Payé', 0.00, 'En attente de collecte', '2026-01-24 12:14:23', '2026-01-24 13:15:51', ''),
(14, 12, '002-2026', '2026-01-22', 'TRANSPORT DE MARCHANDISES', 'CASABLANCA', 'AGADIR', '', '', '', '', 2272.73, 10.00, 'Payé', 0.00, 'En attente de collecte', '2026-01-24 13:15:30', '2026-01-26 15:07:50', ''),
(17, 14, '003-2026', '2026-01-25', 'TRANSPORT DE MARCHANDISES', 'AGADIR ', 'CASABLANCA', '', '', '', '', 3636.36, 10.00, 'Non Payé', 0.00, 'En attente de collecte', '2026-01-26 10:49:55', '2026-01-26 10:50:15', '');

-- --------------------------------------------------------

--
-- Structure de la table `frais`
--

CREATE TABLE `frais` (
  `id` int(11) NOT NULL,
  `categorie_id` int(11) NOT NULL,
  `numero_camion` varchar(50) DEFAULT NULL,
  `montant` decimal(12,2) NOT NULL,
  `date_frais` date NOT NULL,
  `description` text DEFAULT NULL,
  `reference_facture` varchar(100) DEFAULT NULL,
  `mode_paiement` enum('Espèces','Chèque','Virement','Carte') DEFAULT 'Espèces',
  `notes` text DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `frais`
--

INSERT INTO `frais` (`id`, `categorie_id`, `numero_camion`, `montant`, `date_frais`, `description`, `reference_facture`, `mode_paiement`, `notes`, `date_creation`, `date_modification`) VALUES
(1, 1, NULL, 919.38, '2026-01-19', NULL, NULL, 'Virement', NULL, '2026-01-06 12:06:49', '2026-01-27 08:00:45'),
(3, 4, NULL, 1500.00, '2026-01-06', NULL, NULL, 'Espèces', NULL, '2026-01-06 14:47:45', '2026-01-06 14:47:45'),
(4, 2, NULL, 150.00, '2026-01-06', NULL, NULL, 'Espèces', NULL, '2026-01-06 14:48:38', '2026-01-06 14:48:38'),
(6, 15, '94432 @ 33', 2900.00, '2026-01-14', 'chauffeur brahim ', '0003963', 'Espèces', NULL, '2026-01-14 15:39:01', '2026-01-14 15:39:01'),
(7, 7, NULL, 1547.00, '2026-01-14', NULL, '1547', 'Espèces', NULL, '2026-01-14 15:41:49', '2026-01-14 15:41:49'),
(8, 18, NULL, 522.00, '2026-01-16', NULL, NULL, 'Espèces', NULL, '2026-01-16 19:10:17', '2026-01-16 19:10:17'),
(9, 16, NULL, 1609.78, '2026-02-20', NULL, NULL, 'Chèque', NULL, '2026-01-20 11:57:26', '2026-01-20 11:57:26');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom_utilisateur` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','operateur') DEFAULT 'operateur',
  `actif` tinyint(1) DEFAULT 1,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `derniere_connexion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom_utilisateur`, `mot_de_passe`, `nom_complet`, `email`, `role`, `actif`, `date_creation`, `derniere_connexion`) VALUES
(1, 'admin', '$2b$10$VqVY0nS.s6./ORAfYwe64OyLHRRTLQogdeVNzNOeenPtGJBE9Ea5K', 'Administrateur', 'admin@gargaa.com', 'admin', 1, '2025-12-05 08:28:36', '2026-01-27 10:34:18');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_alertes_paiement`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_alertes_paiement` (
`id` int(11)
,`client_id` int(11)
,`numero_expedition` varchar(50)
,`date_expedition` date
,`type_marchandises` varchar(100)
,`ville_depart` varchar(100)
,`ville_arrivee` varchar(100)
,`type_camion` varchar(50)
,`numero_camion` varchar(50)
,`nom_chauffeur` varchar(100)
,`telephone_chauffeur` varchar(20)
,`prix_ht` decimal(12,2)
,`taux_tva` decimal(5,2)
,`montant_taxe` decimal(12,2)
,`prix_ttc` decimal(12,2)
,`statut_paiement` enum('Payé','Non Payé','Incomplet')
,`montant_paye` decimal(12,2)
,`solde_restant` decimal(12,2)
,`statut_livraison` enum('En attente de collecte','En Transit','Livré','Annulé')
,`date_creation` timestamp
,`date_modification` timestamp
,`notes` text
,`nom_entite` varchar(150)
,`telephone_client` varchar(20)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_frais_par_camion`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_frais_par_camion` (
`numero_camion` varchar(50)
,`nombre_frais` bigint(21)
,`montant_total` decimal(34,2)
,`annee` int(4)
,`mois` int(2)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_frais_par_categorie`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_frais_par_categorie` (
`categorie_id` int(11)
,`categorie_nom` varchar(100)
,`type_categorie` enum('Magasin','Camion','Autre')
,`nombre_frais` bigint(21)
,`montant_total` decimal(34,2)
,`annee` int(4)
,`mois` int(2)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_statistiques_mensuelles`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_statistiques_mensuelles` (
`annee` int(4)
,`mois` int(2)
,`nombre_livraisons` bigint(21)
,`revenu_total_ttc` decimal(34,2)
,`solde_total_restant` decimal(34,2)
,`livraisons_terminees` decimal(22,0)
,`paiements_complets` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_alertes_paiement`
--
DROP TABLE IF EXISTS `v_alertes_paiement`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_alertes_paiement`  AS SELECT `e`.`id` AS `id`, `e`.`client_id` AS `client_id`, `e`.`numero_expedition` AS `numero_expedition`, `e`.`date_expedition` AS `date_expedition`, `e`.`type_marchandises` AS `type_marchandises`, `e`.`ville_depart` AS `ville_depart`, `e`.`ville_arrivee` AS `ville_arrivee`, `e`.`type_camion` AS `type_camion`, `e`.`numero_camion` AS `numero_camion`, `e`.`nom_chauffeur` AS `nom_chauffeur`, `e`.`telephone_chauffeur` AS `telephone_chauffeur`, `e`.`prix_ht` AS `prix_ht`, `e`.`taux_tva` AS `taux_tva`, `e`.`montant_taxe` AS `montant_taxe`, `e`.`prix_ttc` AS `prix_ttc`, `e`.`statut_paiement` AS `statut_paiement`, `e`.`montant_paye` AS `montant_paye`, `e`.`solde_restant` AS `solde_restant`, `e`.`statut_livraison` AS `statut_livraison`, `e`.`date_creation` AS `date_creation`, `e`.`date_modification` AS `date_modification`, `e`.`notes` AS `notes`, `c`.`nom_entite` AS `nom_entite`, `c`.`numero_telephone` AS `telephone_client` FROM (`expeditions` `e` join `clients` `c` on(`e`.`client_id` = `c`.`id`)) WHERE `e`.`solde_restant` > 0 AND `e`.`statut_livraison` = 'Livré' ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_frais_par_camion`
--
DROP TABLE IF EXISTS `v_frais_par_camion`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_frais_par_camion`  AS SELECT `f`.`numero_camion` AS `numero_camion`, count(`f`.`id`) AS `nombre_frais`, sum(`f`.`montant`) AS `montant_total`, year(`f`.`date_frais`) AS `annee`, month(`f`.`date_frais`) AS `mois` FROM `frais` AS `f` WHERE `f`.`numero_camion` is not null GROUP BY `f`.`numero_camion`, year(`f`.`date_frais`), month(`f`.`date_frais`) ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_frais_par_categorie`
--
DROP TABLE IF EXISTS `v_frais_par_categorie`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_frais_par_categorie`  AS SELECT `c`.`id` AS `categorie_id`, `c`.`nom` AS `categorie_nom`, `c`.`type_categorie` AS `type_categorie`, count(`f`.`id`) AS `nombre_frais`, coalesce(sum(`f`.`montant`),0) AS `montant_total`, year(`f`.`date_frais`) AS `annee`, month(`f`.`date_frais`) AS `mois` FROM (`categories_frais` `c` left join `frais` `f` on(`c`.`id` = `f`.`categorie_id`)) GROUP BY `c`.`id`, `c`.`nom`, `c`.`type_categorie`, year(`f`.`date_frais`), month(`f`.`date_frais`) ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_statistiques_mensuelles`
--
DROP TABLE IF EXISTS `v_statistiques_mensuelles`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_statistiques_mensuelles`  AS SELECT year(`expeditions`.`date_expedition`) AS `annee`, month(`expeditions`.`date_expedition`) AS `mois`, count(0) AS `nombre_livraisons`, sum(`expeditions`.`prix_ttc`) AS `revenu_total_ttc`, sum(`expeditions`.`solde_restant`) AS `solde_total_restant`, sum(case when `expeditions`.`statut_livraison` = 'Livré' then 1 else 0 end) AS `livraisons_terminees`, sum(case when `expeditions`.`statut_paiement` = 'Payé' then 1 else 0 end) AS `paiements_complets` FROM `expeditions` GROUP BY year(`expeditions`.`date_expedition`), month(`expeditions`.`date_expedition`) ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories_frais`
--
ALTER TABLE `categories_frais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type_categorie` (`type_categorie`),
  ADD KEY `idx_actif` (`actif`);

--
-- Index pour la table `chauffeurs`
--
ALTER TABLE `chauffeurs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nom` (`nom_complet`),
  ADD KEY `idx_telephone` (`telephone`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nom_entite` (`nom_entite`),
  ADD KEY `idx_telephone` (`numero_telephone`),
  ADD KEY `idx_type_client` (`type_client`),
  ADD KEY `idx_ice` (`ice`);

--
-- Index pour la table `devis`
--
ALTER TABLE `devis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Index pour la table `expeditions`
--
ALTER TABLE `expeditions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_expedition` (`numero_expedition`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_date_expedition` (`date_expedition`),
  ADD KEY `idx_statut_paiement` (`statut_paiement`),
  ADD KEY `idx_statut_livraison` (`statut_livraison`),
  ADD KEY `idx_numero_expedition` (`numero_expedition`);

--
-- Index pour la table `frais`
--
ALTER TABLE `frais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categorie` (`categorie_id`),
  ADD KEY `idx_date` (`date_frais`),
  ADD KEY `idx_numero_camion` (`numero_camion`),
  ADD KEY `idx_mode_paiement` (`mode_paiement`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom_utilisateur` (`nom_utilisateur`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories_frais`
--
ALTER TABLE `categories_frais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT pour la table `chauffeurs`
--
ALTER TABLE `chauffeurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `devis`
--
ALTER TABLE `devis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `expeditions`
--
ALTER TABLE `expeditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `frais`
--
ALTER TABLE `frais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `devis`
--
ALTER TABLE `devis`
  ADD CONSTRAINT `devis_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `expeditions`
--
ALTER TABLE `expeditions`
  ADD CONSTRAINT `expeditions_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

--
-- Contraintes pour la table `frais`
--
ALTER TABLE `frais`
  ADD CONSTRAINT `frais_ibfk_1` FOREIGN KEY (`categorie_id`) REFERENCES `categories_frais` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
