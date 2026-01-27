"use client";

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Frais {
  id: number;
  categorie_id: number;
  numero_camion?: string;
  montant: number;
  date_frais: string;
  description?: string;
  reference_facture?: string;
  mode_paiement: string;
  notes?: string;
}

interface Category {
  id: number;
  nom: string;
  type_categorie: 'Magasin' | 'Camion' | 'Autre';
}

interface FraisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frais: Frais | null;
  categories: Category[];
  onSave: (data: any) => Promise<void>;
  fixedType?: 'Magasin' | 'Camion' | 'Autre';
}

export function FraisDialog({ open, onOpenChange, frais, categories, onSave, fixedType }: FraisDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categorie_id: '',
    numero_camion: '',
    montant: '',
    date_frais: '',
    description: '',
    reference_facture: '',
    mode_paiement: 'Espèces',
    notes: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (frais) {
      setFormData({
        categorie_id: frais.categorie_id.toString(),
        numero_camion: frais.numero_camion || '',
        montant: frais.montant.toString(),
        date_frais: frais.date_frais,
        description: frais.description || '',
        reference_facture: frais.reference_facture || '',
        mode_paiement: frais.mode_paiement,
        notes: frais.notes || '',
      });
      const cat = categories.find(c => c.id === frais.categorie_id);
      setSelectedCategory(cat || null);
    } else {
      setFormData({
        categorie_id: '',
        numero_camion: '',
        montant: '',
        date_frais: new Date().toISOString().split('T')[0],
        description: '',
        reference_facture: '',
        mode_paiement: 'Espèces',
        notes: '',
      });
      setSelectedCategory(null);
    }
  }, [frais, categories, open]);

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, categorie_id: value });
    const cat = categories.find(c => c.id.toString() === value);
    setSelectedCategory(cat || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        categorie_id: parseInt(formData.categorie_id),
        montant: parseFloat(formData.montant),
        numero_camion: formData.numero_camion || null,
        description: formData.description || null,
        reference_facture: formData.reference_facture || null,
        notes: formData.notes || null,
      };

      await onSave(data);
      toast.success(frais ? 'Frais modifié avec succès' : 'Frais créé avec succès');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // Group categories by type (filter by fixedType if provided)
  const categoriesByType = {
    Magasin: categories.filter(c => c.type_categorie === 'Magasin'),
    Camion: categories.filter(c => c.type_categorie === 'Camion'),
    Autre: categories.filter(c => c.type_categorie === 'Autre'),
  };

  // If fixedType is provided, only show categories of that type
  const availableCategories = fixedType 
    ? categoriesByType[fixedType]
    : categories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{frais ? 'Modifier le frais' : 'Ajouter un nouveau frais'}</DialogTitle>
          <DialogDescription>
            {frais ? 'Modifiez les informations du frais' : 'Remplissez les informations du nouveau frais'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Catégorie *</Label>
              <Select 
                value={formData.categorie_id} 
                onValueChange={handleCategoryChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {fixedType ? (
                    // Show only one type
                    availableCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                    ))
                  ) : (
                    // Show all types grouped
                    <>
                      <SelectGroup>
                        <SelectLabel>Magasin</SelectLabel>
                        {categoriesByType.Magasin.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Camion</SelectLabel>
                        {categoriesByType.Camion.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Autre</SelectLabel>
                        {categoriesByType.Autre.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                        ))}
                      </SelectGroup>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Montant (DH) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                required
                value={formData.date_frais}
                onChange={(e) => setFormData({ ...formData, date_frais: e.target.value })}
              />
            </div>

            {selectedCategory?.type_categorie === 'Camion' && (
              <div className="col-span-2 space-y-2">
                <Label>Numéro de Camion</Label>
                <Input
                  value={formData.numero_camion}
                  onChange={(e) => setFormData({ ...formData, numero_camion: e.target.value })}
                  placeholder="ex: 123-A-45"
                />
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du frais..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Référence Facture</Label>
              <Input
                value={formData.reference_facture}
                onChange={(e) => setFormData({ ...formData, reference_facture: e.target.value })}
                placeholder="N° facture/reçu"
              />
            </div>

            <div className="space-y-2">
              <Label>Mode de Paiement *</Label>
              <Select 
                value={formData.mode_paiement} 
                onValueChange={(value) => setFormData({ ...formData, mode_paiement: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                  <SelectItem value="Virement">Virement</SelectItem>
                  <SelectItem value="Carte">Carte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {frais ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
