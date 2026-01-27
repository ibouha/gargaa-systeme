"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Client {
  id: number;
  type_client: 'Entreprise' | 'Particulier';
  nom_entite: string;
  numero_telephone: string;
  adresse_complete: string;
  email?: string;
  ice?: string;
  notes?: string;
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type_client: 'Particulier' as 'Entreprise' | 'Particulier',
    nom_entite: '',
    numero_telephone: '',
    adresse_complete: '',
    email: '',
    ice: '',
    notes: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        type_client: client.type_client,
        nom_entite: client.nom_entite,
        numero_telephone: client.numero_telephone,
        adresse_complete: client.adresse_complete,
        email: client.email || '',
        ice: client.ice || '',
        notes: client.notes || '',
      });
    } else {
      setFormData({
        type_client: 'Particulier',
        nom_entite: '',
        numero_telephone: '',
        adresse_complete: '',
        email: '',
        ice: '',
        notes: '',
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (client) {
        await api.updateClient(client.id, formData);
        toast.success('Client modifié avec succès');
      } else {
        await api.createClient(formData);
        toast.success('Client créé avec succès');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? 'Modifier le client' : 'Ajouter un nouveau client'}</DialogTitle>
          <DialogDescription>
            {client ? 'Modifiez les informations du client' : 'Remplissez les informations du nouveau client'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type de Client</Label>
            <Select 
              value={formData.type_client} 
              onValueChange={(value: 'Entreprise' | 'Particulier') => 
                setFormData({ ...formData, type_client: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Particulier">Particulier</SelectItem>
                <SelectItem value="Entreprise">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nom de l&apos;Entité / Individu *</Label>
            <Input
              required
              value={formData.nom_entite}
              onChange={(e) => setFormData({ ...formData, nom_entite: e.target.value })}
              placeholder={formData.type_client === 'Entreprise' ? 'Nom de la société' : 'Nom et prénom'}
            />
          </div>

          <div className="space-y-2">
            <Label>Numéro de Téléphone *</Label>
            <Input
              required
              value={formData.numero_telephone}
              onChange={(e) => setFormData({ ...formData, numero_telephone: e.target.value })}
              placeholder="+213 555 123 456"
            />
          </div>

          <div className="space-y-2">
            <Label>Adresse Complète *</Label>
            <Textarea
              required
              value={formData.adresse_complete}
              onChange={(e) => setFormData({ ...formData, adresse_complete: e.target.value })}
              placeholder="Rue, Code postal, Ville, Pays"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Email (optionnel)</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <Label>ICE (optionnel)</Label>
            <Input
              value={formData.ice}
              onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
              placeholder="000000000000000"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

