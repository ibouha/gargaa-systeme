"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin, FileText } from 'lucide-react';

interface Alerte {
  id: number;
  numero_expedition: string;
  nom_entite: string;
  telephone_client: string;
  date_expedition: string;
  ville_depart: string;
  ville_arrivee: string;
  prix_ttc: number;
  montant_paye: number;
  solde_restant: number;
  statut_paiement: string;
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const response = await api.getAlertes();
        if (response.success) {
          setAlertes(response.data as Alerte[]);
        }
      } catch (error) {
        console.error('Erreur chargement alertes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertes();
  }, []);

  const downloadFacture = (id: number) => {
    const url = api.getFactureUrl(id);
    window.open(url, '_blank');
  };

  const totalSolde = alertes.reduce((acc, a) => acc + parseFloat(String(a.solde_restant)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-8 w-8" />
            Alertes de Paiement
          </h1>
          <p className="text-muted-foreground">
            Livraisons terminées avec solde impayé
          </p>
        </div>
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Solde total à recouvrer</p>
            <p className="text-2xl font-bold text-red-600">
              {totalSolde.toFixed(2)} DH
            </p>
          </CardContent>
        </Card>
      </div>

      {alertes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <AlertTriangle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-600">Aucune alerte</h3>
              <p className="text-muted-foreground">
                Toutes les livraisons terminées ont été payées
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alertes.map((alerte) => (
            <Card 
              key={alerte.id} 
              className="border-red-200 bg-red-50/50 dark:bg-red-950/20"
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {alerte.numero_expedition}
                      <Badge variant="destructive">Impayé</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Client: <span className="font-semibold">{alerte.nom_entite}</span>
                    </CardDescription>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-red-600">
                      {parseFloat(String(alerte.solde_restant)).toFixed(2)} DH
                    </p>
                    <p className="text-sm text-muted-foreground">à recouvrer</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{alerte.ville_depart} → {alerte.ville_arrivee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{alerte.telephone_client}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Date: </span>
                    {new Date(alerte.date_expedition).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">TTC: </span>
                    <span className="font-medium">{parseFloat(String(alerte.prix_ttc)).toFixed(2)} DH</span>
                    <span className="mx-2 hidden sm:inline">|</span>
                    <span className="block sm:inline mt-1 sm:mt-0">
                      <span className="text-muted-foreground">Payé: </span>
                      <span className="font-medium">{parseFloat(String(alerte.montant_paye)).toFixed(2)} DH</span>
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadFacture(alerte.id)} className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Télécharger Facture
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

