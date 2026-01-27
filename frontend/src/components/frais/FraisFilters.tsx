"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FiltersProps {
  filters: {
    date_debut: string;
    date_fin: string;
    categorie_id: string;
    numero_camion: string;
    mode_paiement: string;
  };
  setFilters: (filters: any) => void;
  categories: any[];
  activeTab: string;
}

export function FraisFilters({ filters, setFilters, categories, activeTab }: FiltersProps) {
  const filteredCategories = activeTab !== 'Tous' 
    ? categories.filter(c => c.type_categorie === activeTab)
    : categories;

  const hasFilters = filters.date_debut || filters.date_fin || filters.categorie_id || 
                     filters.numero_camion || filters.mode_paiement;

  const clearFilters = () => {
    setFilters({
      ...filters,
      date_debut: '',
      date_fin: '',
      categorie_id: '',
      numero_camion: '',
      mode_paiement: '',
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[150px] space-y-2">
            <Label className="text-sm">Date Début</Label>
            <Input
              type="date"
              value={filters.date_debut}
              onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
            />
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <Label className="text-sm">Date Fin</Label>
            <Input
              type="date"
              value={filters.date_fin}
              onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
            />
          </div>

          <div className="flex-1 min-w-[180px] space-y-2">
            <Label className="text-sm">Catégorie</Label>
            <Select
              value={filters.categorie_id || 'all'}
              onValueChange={(value) => setFilters({ ...filters, categorie_id: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {filteredCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === 'Camion' && (
            <div className="flex-1 min-w-[150px] space-y-2">
              <Label className="text-sm">N° Camion</Label>
              <Input
                value={filters.numero_camion}
                onChange={(e) => setFilters({ ...filters, numero_camion: e.target.value })}
                placeholder="123-A-45"
              />
            </div>
          )}

          <div className="flex-1 min-w-[150px] space-y-2">
            <Label className="text-sm">Paiement</Label>
            <Select
              value={filters.mode_paiement || 'all'}
              onValueChange={(value) => setFilters({ ...filters, mode_paiement: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Virement">Virement</SelectItem>
                <SelectItem value="Carte">Carte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
