"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Store, Truck, MoreHorizontal, Loader2 } from 'lucide-react';

interface StatsProps {
  stats: any;
  loading: boolean;
}

export function FraisStats({ stats, loading }: StatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalGeneral = stats.total?.montant_total || 0;
  const totalMagasin = stats.parType?.find((t: any) => t.type_categorie === 'Magasin')?.montant_total || 0;
  const totalCamion = stats.parType?.find((t: any) => t.type_categorie === 'Camion')?.montant_total || 0;
  const totalAutre = stats.parType?.find((t: any) => t.type_categorie === 'Autre')?.montant_total || 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Général</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{parseFloat(totalGeneral).toFixed(2)} DH</div>
          <p className="text-xs text-muted-foreground">
            {stats.total?.nombre_frais || 0} frais enregistrés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Frais Magasin</CardTitle>
          <Store className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {parseFloat(totalMagasin).toFixed(2)} DH
          </div>
          <p className="text-xs text-muted-foreground">
            {((totalMagasin / totalGeneral) * 100 || 0).toFixed(1)}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Frais Camion</CardTitle>
          <Truck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {parseFloat(totalCamion).toFixed(2)} DH
          </div>
          <p className="text-xs text-muted-foreground">
            {((totalCamion / totalGeneral) * 100 || 0).toFixed(1)}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Autres Frais</CardTitle>
          <MoreHorizontal className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">
            {parseFloat(totalAutre).toFixed(2)} DH
          </div>
          <p className="text-xs text-muted-foreground">
            {((totalAutre / totalGeneral) * 100 || 0).toFixed(1)}% du total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
