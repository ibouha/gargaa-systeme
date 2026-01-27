"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expeditionSchema, ExpeditionFormValues } from '@/schemas/expedition';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Client {
  id: number;
  nom_entite: string;
}

interface Expedition {
  id: number;
  client_id: number;
  numero_expedition: string;
  date_expedition: string;
  type_marchandises: string;
  ville_depart: string;
  ville_arrivee: string;
  type_camion: string;
  numero_camion: string;
  nom_chauffeur: string;
  telephone_chauffeur: string;
  prix_ht: number;
  taux_tva: number;
  montant_paye: number;
  statut_paiement: string;
  statut_livraison: string;
  notes?: string;
}

interface ExpeditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedition: Expedition | null;
  onSuccess: () => void;
}

export function ExpeditionDialog({ open, onOpenChange, expedition, onSuccess }: ExpeditionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<ExpeditionFormValues>({
    resolver: zodResolver(expeditionSchema),
    defaultValues: {
      client_id: '',
      numero_expedition: '',
      date_expedition: new Date().toISOString().split('T')[0],
      type_marchandises: '',
      ville_depart: '',
      ville_arrivee: '',
      type_camion: '',
      numero_camion: '',
      nom_chauffeur: '',
      telephone_chauffeur: '',
      prix_ht: 0,
      prix_ttc: 0,
      taux_tva: 10,
      montant_paye: 0,
      statut_paiement: 'Non Payé',
      statut_livraison: 'En attente de collecte',
      notes: '',
    }
  });

  const { reset, watch, setValue, control, register, formState: { errors } } = form;

  // Calculs automatiques
  const prixHT = watch('prix_ht');
  const tauxTVA = watch('taux_tva');
  const prixTTC = watch('prix_ttc');
  const montantPaye = watch('montant_paye');

  const montantTaxe = prixTTC - prixHT;
  const soldeRestant = prixTTC - montantPaye;

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.getClients({ limit: '1000' });
      if (response.success) {
        setClients(response.data as Client[]);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open, fetchClients]);

  useEffect(() => {
    if (expedition) {
      // Calculate prix_ttc from stored prix_ht with proper rounding
      const calculatedPrixTTC = Math.round(Number(expedition.prix_ht) * (1 + Number(expedition.taux_tva) / 100) * 100) / 100;

      reset({
        client_id: String(expedition.client_id),
        numero_expedition: expedition.numero_expedition,
        date_expedition: expedition.date_expedition.split('T')[0],
        type_marchandises: expedition.type_marchandises || '',
        ville_depart: expedition.ville_depart,
        ville_arrivee: expedition.ville_arrivee,
        type_camion: expedition.type_camion || '',
        numero_camion: expedition.numero_camion || '',
        nom_chauffeur: expedition.nom_chauffeur || '',
        telephone_chauffeur: expedition.telephone_chauffeur || '',
        prix_ht: Number(expedition.prix_ht),
        prix_ttc: calculatedPrixTTC,
        taux_tva: Number(expedition.taux_tva),
        montant_paye: Number(expedition.montant_paye),
        statut_paiement: expedition.statut_paiement as "Payé" | "Non Payé" | "Incomplet",
        statut_livraison: expedition.statut_livraison as "En attente de collecte" | "En Transit" | "Livré" | "Annulé",
        notes: expedition.notes || '',
      });
    } else {
      // Fetch next number
      api.getNextExpeditionNumber().then(response => {
        if (response.success && response.data) {
          setValue('numero_expedition', response.data.nextNumero);
        }
      }).catch(err => {
        console.error("Failed to fetch next number", err);
      });

      reset({
        client_id: '',
        numero_expedition: '', // Will be filled by async call
        date_expedition: new Date().toISOString().split('T')[0],
        type_marchandises: '',
        ville_depart: '',
        ville_arrivee: '',
        type_camion: '',
        numero_camion: '',
        nom_chauffeur: '',
        telephone_chauffeur: '',
        prix_ht: 0,
        prix_ttc: 0,
        taux_tva: 10,
        montant_paye: 0,
        statut_paiement: 'Non Payé',
        statut_livraison: 'En attente de collecte',
        notes: '',
      });
    }
  }, [expedition, open, reset, setValue]);

  const onSubmit = async (data: ExpeditionFormValues) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        client_id: parseInt(data.client_id),
        prix_ttc: undefined, // Remove prix_ttc as backend expects only prix_ht
      };

      if (expedition) {
        await api.updateExpedition(expedition.id, payload);
        toast.success('Expédition modifiée avec succès');
      } else {
        await api.createExpedition(payload);
        toast.success('Expédition créée avec succès');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // Handler when user enters Prix HT - calculate Prix TTC
  const handlePrixHTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setValue('prix_ht', value);
    const newPrixTTC = Math.round(value * (1 + tauxTVA / 100) * 100) / 100;
    setValue('prix_ttc', newPrixTTC);
  };

  // Handler when user enters Prix TTC - calculate Prix HT
  const handlePrixTTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setValue('prix_ttc', value);
    const newPrixHT = Math.round((value / (1 + tauxTVA / 100)) * 100) / 100;
    setValue('prix_ht', newPrixHT);
  };

  // Handler when user changes TVA rate - recalculate based on Prix HT
  const handleTVAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setValue('taux_tva', value);
    const newPrixTTC = Math.round(prixHT * (1 + value / 100) * 100) / 100;
    setValue('prix_ttc', newPrixTTC);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expedition ? 'Modifier l\'expédition' : 'Nouvelle expédition'}</DialogTitle>
          <DialogDescription>
            {expedition ? 'Modifiez les détails de l\'expédition' : 'Enregistrez une nouvelle expédition'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="reference" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="reference">Référence</TabsTrigger>
              <TabsTrigger value="logistique">Logistique</TabsTrigger>
              <TabsTrigger value="transport">Transport</TabsTrigger>
              <TabsTrigger value="financier">Financier</TabsTrigger>
              <TabsTrigger value="statut">Statut</TabsTrigger>
            </TabsList>

            <TabsContent value="reference" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Controller
                    control={control}
                    name="client_id"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                        <SelectContent>
                          {clients.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.nom_entite}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.client_id && <span className="text-red-500 text-sm">{errors.client_id.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>N° Expédition</Label>
                  <Input
                    {...register('numero_expedition')}
                    placeholder="Auto-généré (XXX-2026)"
                  />
                  <span className="text-xs text-muted-foreground">Laissez vide pour génération automatique</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logistique" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date d&apos;Expédition *</Label>
                  <Input type="date" {...register('date_expedition')} />
                  {errors.date_expedition && <span className="text-red-500 text-sm">{errors.date_expedition.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Type de Marchandises</Label>
                  <Input {...register('type_marchandises')} placeholder="Fragile, Alimentaire..." />
                </div>
                <div className="space-y-2">
                  <Label>Ville de Départ *</Label>
                  <Input {...register('ville_depart')} />
                  {errors.ville_depart && <span className="text-red-500 text-sm">{errors.ville_depart.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Ville d&apos;Arrivée *</Label>
                  <Input {...register('ville_arrivee')} />
                  {errors.ville_arrivee && <span className="text-red-500 text-sm">{errors.ville_arrivee.message}</span>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transport" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de Camion</Label>
                  <Input {...register('type_camion')} placeholder="Semi-remorque, Camionnette..." />
                </div>
                <div className="space-y-2">
                  <Label>N° Camion</Label>
                  <Input {...register('numero_camion')} />
                </div>
                <div className="space-y-2">
                  <Label>Nom du Chauffeur</Label>
                  <Input {...register('nom_chauffeur')} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone Chauffeur</Label>
                  <Input {...register('telephone_chauffeur')} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financier" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix HT (DH) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    onChange={handlePrixHTChange}
                    value={prixHT}
                  />
                  {errors.prix_ht && <span className="text-red-500 text-sm">{errors.prix_ht.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Taux TVA (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    onChange={handleTVAChange}
                    value={tauxTVA}
                  />
                  {errors.taux_tva && <span className="text-red-500 text-sm">{errors.taux_tva.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Prix TTC (DH) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    onChange={handlePrixTTCChange}
                    value={prixTTC}
                  />
                  {errors.prix_ttc && <span className="text-red-500 text-sm">{errors.prix_ttc.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Montant Taxe (calculé)</Label>
                  <Input value={montantTaxe.toFixed(2) + ' DH'} disabled className="bg-muted" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statut" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant Payé (DH)</Label>
                  <Input
                    type="number" step="0.01"
                    {...register('montant_paye', { valueAsNumber: true })}
                  />
                  {errors.montant_paye && <span className="text-red-500 text-sm">{errors.montant_paye.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Solde Restant (calculé)</Label>
                  <Input value={soldeRestant.toFixed(2) + ' DH'} disabled className={`bg-muted font-bold ${soldeRestant > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div className="space-y-2">
                  <Label>Statut Paiement</Label>
                  <Controller
                    control={control}
                    name="statut_paiement"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Non Payé">Non Payé</SelectItem>
                          <SelectItem value="Incomplet">Incomplet</SelectItem>
                          <SelectItem value="Payé">Payé</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut Livraison</Label>
                  <Controller
                    control={control}
                    name="statut_livraison"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="En attente de collecte">En attente de collecte</SelectItem>
                          <SelectItem value="En Transit">En Transit</SelectItem>
                          <SelectItem value="Livré">Livré</SelectItem>
                          <SelectItem value="Annulé">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea {...register('notes')} rows={3} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {expedition ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
