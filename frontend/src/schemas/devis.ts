import { z } from 'zod';

export const devisSchema = z.object({
    client_id: z.string().min(1, 'Client est requis'),
    numero_devis: z.string().optional(),
    date_devis: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Date invalide',
    }),
    ville_depart: z.string().min(1, 'Ville de départ est requise'),
    ville_arrivee: z.string().min(1, 'Ville d\'arrivée est requise'),
    type_marchandises: z.string().optional(),
    prix_ht: z.number().min(0, 'Le prix HT doit être positif'),
    taux_tva: z.number().min(0).max(100, 'Le taux TVA doit être entre 0 et 100'),
    prix_ttc: z.number().min(0, 'Le prix TTC doit être positif'),
    statut: z.enum(['En attente', 'Accepté', 'Refusé', 'Transformé']),
    notes: z.string().optional(),
});

export type DevisFormValues = z.infer<typeof devisSchema>;
