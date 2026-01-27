import { z } from 'zod';

export const expeditionSchema = z.object({
    client_id: z.string().min(1, 'Client est requis'),
    numero_expedition: z.string().optional(),
    date_expedition: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Date invalide',
    }),
    type_marchandises: z.string().optional(),
    ville_depart: z.string().min(1, 'Ville de départ est requise'),
    ville_arrivee: z.string().min(1, 'Ville d\'arrivée est requise'),
    type_camion: z.string().optional(),
    numero_camion: z.string().optional(),
    nom_chauffeur: z.string().optional(),
    telephone_chauffeur: z.string().optional(),

    // Financials - ensuring numbers are non-negative
    prix_ht: z.number().min(0, 'Le prix HT doit être positif'),
    taux_tva: z.number().min(0).max(100, 'Le taux TVA doit être entre 0 et 100'),
    prix_ttc: z.number().min(0, 'Le prix TTC doit être positif'),

    montant_paye: z.number().min(0, 'Le montant payé doit être positif'),

    statut_paiement: z.enum(['Payé', 'Non Payé', 'Incomplet']),
    statut_livraison: z.enum(['En attente de collecte', 'En Transit', 'Livré', 'Annulé']),

    notes: z.string().optional(),
});

export type ExpeditionFormValues = z.infer<typeof expeditionSchema>;
