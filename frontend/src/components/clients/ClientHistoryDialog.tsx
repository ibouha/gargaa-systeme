"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Client {
  id: number;
  nom_entite: string;
}

interface Expedition {
  id: number;
  numero_expedition: string;
  date_expedition: string;
  ville_depart: string;
  ville_arrivee: string;
  prix_ttc: number;
  statut_paiement: string;
  statut_livraison: string;
  solde_restant: number;
}

interface ClientHistoryDialogProps {
  client: Client | null;
  onClose: () => void;
}

export function ClientHistoryDialog({ client, onClose }: ClientHistoryDialogProps) {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setLoading(true);
      api.getClientExpeditions(client.id)
        .then((response) => {
          if (response.success) {
            setExpeditions(response.data as Expedition[]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [client]);

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Livré': 'default',
      'En Transit': 'secondary',
      'En attente de collecte': 'outline',
      'Annulé': 'destructive',
    };
    return <Badge variant={variants[statut] || 'secondary'}>{statut}</Badge>;
  };

  const getPaiementBadge = (statut: string, solde: number) => {
    if (statut === 'Payé') return <Badge className="bg-green-600">Payé</Badge>;
    if (statut === 'Incomplet') return <Badge className="bg-yellow-600">Incomplet</Badge>;
    return <Badge variant="destructive">Non Payé</Badge>;
  };

  return (
    <Dialog open={!!client} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historique des Expéditions</DialogTitle>
          <DialogDescription>
            Client: {client?.nom_entite}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : expeditions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Aucune expédition pour ce client
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {expeditions.map((exp) => (
                <div 
                  key={exp.id} 
                  className={`p-4 border rounded-lg ${
                    parseFloat(String(exp.solde_restant)) > 0 && exp.statut_livraison === 'Livré' 
                      ? 'border-red-300 bg-red-50 dark:bg-red-950/20' 
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{exp.numero_expedition}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exp.date_expedition).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getStatutBadge(exp.statut_livraison)}
                      {getPaiementBadge(exp.statut_paiement, parseFloat(String(exp.solde_restant)))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{exp.ville_depart} → {exp.ville_arrivee}</span>
                    <span className="font-medium">
                      {parseFloat(String(exp.prix_ttc)).toFixed(2)} DA
                    </span>
                  </div>
                  {parseFloat(String(exp.solde_restant)) > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Solde dû: {parseFloat(String(exp.solde_restant)).toFixed(2)} DA
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

