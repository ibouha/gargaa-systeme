"use client";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface FraisTableProps {
  frais: any[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onEdit: (frais: any) => void;
  onDelete: (id: number) => void;
  hideTypeColumn?: boolean;  // Hide type column on type-specific pages
  hideTruckColumn?: boolean; // Hide truck column for non-truck expenses
}

export function FraisTable({ 
  frais, 
  loading, 
  pagination, 
  onPageChange, 
  onEdit, 
  onDelete, 
  hideTypeColumn = false,
  hideTruckColumn = false
}: FraisTableProps) {
  const getCategoryBadge = (type: string) => {
    const colors = {
      Magasin: 'bg-blue-100 text-blue-800',
      Camion: 'bg-green-100 text-green-800',
      Autre: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || colors.Autre;
  };

  const getPaymentBadge = (mode: string) => {
    const colors = {
      'Espèces': 'bg-emerald-100 text-emerald-800',
      'Chèque': 'bg-purple-100 text-purple-800',
      'Virement': 'bg-indigo-100 text-indigo-800',
      'Carte': 'bg-pink-100 text-pink-800',
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (frais.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun frais trouvé
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {!hideTypeColumn && <TableHead>Type</TableHead>}
              <TableHead>Catégorie</TableHead>
              <TableHead>Description</TableHead>
              {!hideTruckColumn && <TableHead>Camion</TableHead>}
              <TableHead>Montant</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {frais.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(f.date_frais).toLocaleDateString('fr-FR')}
                </TableCell>
                {!hideTypeColumn && (
                  <TableCell>
                    <Badge className={getCategoryBadge(f.type_categorie)}>
                      {f.type_categorie}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="font-medium">{f.categorie_nom}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {f.description || '-'}
                </TableCell>
                {!hideTruckColumn && <TableCell>{f.numero_camion || '-'}</TableCell>}
                <TableCell className="font-semibold">{parseFloat(f.montant).toFixed(2)} DH</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPaymentBadge(f.mode_paiement)}>
                    {f.mode_paiement}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(f)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(f.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage {((pagination.page - 1) * pagination.limit) + 1} à{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} frais
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
