"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, Users, DollarSign, AlertTriangle, 
  TrendingUp, Package, Clock 
} from 'lucide-react';

interface DashboardStats {
  mois: { livraisons: number; revenu_ttc: number; solde_restant: number };
  semaine: { livraisons: number };
  annee: { livraisons: number; revenu_ttc: number };
  solde_total_restant: number;
  livraisons_en_transit: Array<{
    id: number;
    numero_expedition: string;
    nom_entite: string;
    ville_depart: string;
    ville_arrivee: string;
    date_expedition: string;
  }>;
  nombre_alertes: number;
  total_clients: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getDashboardStats();
        if (response.success) {
          setStats(response.data as DashboardStats);
        }
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(amount) + ' DH';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de vos opérations</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Livraisons ce mois</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.mois.livraisons || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.semaine.livraisons || 0} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenu du mois (TTC)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.mois.revenu_ttc || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Année: {formatCurrency(stats?.annee.revenu_ttc || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solde Total Dû</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.solde_total_restant || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(stats?.solde_total_restant || 0)}
            </div>
            <p className="text-xs text-muted-foreground">À recouvrer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clients || 0}</div>
            <p className="text-xs text-muted-foreground">Dans le répertoire</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et Transit */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Alertes */}
        <Card className={stats?.nombre_alertes ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${stats?.nombre_alertes ? 'text-red-600' : ''}`} />
              Alertes de Paiement
            </CardTitle>
            <CardDescription>Livraisons terminées avec solde impayé</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats?.nombre_alertes ? 'text-red-600' : 'text-green-600'}`}>
              {stats?.nombre_alertes || 0}
            </div>
            {stats?.nombre_alertes ? (
              <Badge variant="destructive" className="mt-2">Action requise</Badge>
            ) : (
              <Badge variant="secondary" className="mt-2">Aucune alerte</Badge>
            )}
          </CardContent>
        </Card>

        {/* En Transit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Livraisons en Transit
            </CardTitle>
            <CardDescription>Les 5 plus anciennes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.livraisons_en_transit?.length ? (
                stats.livraisons_en_transit.map((exp) => (
                  <div key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-b pb-2 gap-2">
                    <div>
                      <p className="font-medium">{exp.numero_expedition}</p>
                      <p className="text-xs text-muted-foreground">{exp.nom_entite}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs">{exp.ville_depart} → {exp.ville_arrivee}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exp.date_expedition).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Aucune livraison en transit</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

