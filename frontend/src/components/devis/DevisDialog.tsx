"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { devisSchema, DevisFormValues } from '@/schemas/devis';
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

interface DevisDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    devis: (DevisFormValues & { id: number }) | null;
    onSuccess: () => void;
}

export function DevisDialog({ open, onOpenChange, devis, onSuccess }: DevisDialogProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    const form = useForm<DevisFormValues>({
        resolver: zodResolver(devisSchema),
        defaultValues: {
            client_id: '',
            numero_devis: '',
            date_devis: new Date().toISOString().split('T')[0],
            ville_depart: '',
            ville_arrivee: '',
            type_marchandises: '',
            prix_ht: 0,
            taux_tva: 10,
            prix_ttc: 0,
            statut: 'En attente',
            notes: '',
        }
    });

    const { reset, watch, setValue, control, register, formState: { errors } } = form; // Added register and errors

    // Watch values for auto-calculation
    const prixHT = watch('prix_ht');
    const tauxTVA = watch('taux_tva');
    const prixTTC = watch('prix_ttc');

    // Load clients
    useEffect(() => {
        if (open) {
            const loadClients = async () => {
                try {
                    const response = await api.getClients({ limit: '1000' });
                    if (response.success && Array.isArray(response.data)) {
                        setClients(response.data as Client[]);
                    }
                } catch (error) {
                    console.error('Erreur chargement clients:', error);
                }
            };
            loadClients();
        }
    }, [open]);

    // Reset/Set initial values
    useEffect(() => {
        if (open) {
            if (devis) {
                reset({
                    client_id: String(devis.client_id),
                    numero_devis: devis.numero_devis,
                    date_devis: devis.date_devis.split('T')[0],
                    ville_depart: devis.ville_depart,
                    ville_arrivee: devis.ville_arrivee,
                    type_marchandises: devis.type_marchandises || '',
                    prix_ht: Number(devis.prix_ht),
                    taux_tva: Number(devis.taux_tva),
                    prix_ttc: Number(devis.prix_ttc),
                    statut: devis.statut,
                    notes: devis.notes || '',
                });
            } else {
                // Fetch next number
                api.getNextDevisNumber().then(response => {
                    if (response.success && response.data) {
                        setValue('numero_devis', response.data.nextNumero);
                    }
                }).catch(err => {
                    console.error("Failed to fetch next number", err);
                });

                reset({
                    client_id: '',
                    numero_devis: '', // Will be filled by async call above
                    date_devis: new Date().toISOString().split('T')[0],
                    ville_depart: '',
                    ville_arrivee: '',
                    type_marchandises: '',
                    prix_ht: 0,
                    taux_tva: 10,
                    prix_ttc: 0,
                    statut: 'En attente',
                    notes: '',
                });
            }
        }
    }, [open, devis, reset, setValue]);

    // Auto-calculation logic is tricky with 2-way binding desire (HT->TTC, TTC->HT)
    // For simplicity here, we'll listen to specific field changes via inputs

    const onSubmit = async (data: DevisFormValues) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                client_id: parseInt(data.client_id),
            };

            if (devis) {
                await api.updateDevis(devis.id, payload);
                toast.success('Devis modifié');
            } else {
                await api.createDevis(payload);
                toast.success('Devis créé');
            }
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    const handlePrixHTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        setValue('prix_ht', val);
        const newTTC = Math.round(val * (1 + tauxTVA / 100) * 100) / 100;
        setValue('prix_ttc', newTTC);
    };

    const handlePrixTTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        setValue('prix_ttc', val);
        const newHT = Math.round((val / (1 + tauxTVA / 100)) * 100) / 100;
        setValue('prix_ht', newHT);
    };

    const handleTVAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) || 0;
        setValue('taux_tva', val);
        const newTTC = Math.round(prixHT * (1 + val / 100) * 100) / 100;
        setValue('prix_ttc', newTTC);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{devis ? 'Modifier le Devis' : 'Nouveau Devis'}</DialogTitle>
                    <DialogDescription>
                        {devis ? 'Modifier les informations du devis' : 'Créer un nouveau devis pour un client'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">Informations Générales</TabsTrigger>
                            <TabsTrigger value="detail">Détails & Prix</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Client *</Label>
                                    <Controller
                                        control={control}
                                        name="client_id"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un client" />
                                                </SelectTrigger>
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
                                    <Label>Numéro Devis</Label>
                                    <Input
                                        {...register('numero_devis')}
                                        placeholder="Auto-généré (XXX-2026)"
                                    />
                                    <span className="text-xs text-muted-foreground">Laissez vide pour génération automatique</span>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Devis *</Label>
                                    <Input type="date" {...register('date_devis')} />
                                    {errors.date_devis && <span className="text-red-500 text-sm">{errors.date_devis.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Statut</Label>
                                    <Controller
                                        control={control}
                                        name="statut"
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="En attente">En attente</SelectItem>
                                                    <SelectItem value="Accepté">Accepté</SelectItem>
                                                    <SelectItem value="Refusé">Refusé</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="detail" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ville Départ *</Label>
                                    <Input {...register('ville_depart')} />
                                    {errors.ville_depart && <span className="text-red-500 text-sm">{errors.ville_depart.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Ville Arrivée *</Label>
                                    <Input {...register('ville_arrivee')} />
                                    {errors.ville_arrivee && <span className="text-red-500 text-sm">{errors.ville_arrivee.message}</span>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Type de Marchandise</Label>
                                    <Input {...register('type_marchandises')} placeholder="Description de la marchandise" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label>Prix HT</Label>
                                    <Input
                                        type="number" step="0.01"
                                        onChange={handlePrixHTChange}
                                        value={prixHT}
                                    />
                                    {errors.prix_ht && <span className="text-red-500 text-sm">{errors.prix_ht.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Taux TVA (%)</Label>
                                    <Input
                                        type="number" step="0.01"
                                        onChange={handleTVAChange}
                                        value={tauxTVA}
                                    />
                                    {errors.taux_tva && <span className="text-red-500 text-sm">{errors.taux_tva.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Prix TTC</Label>
                                    <Input
                                        type="number" step="0.01"
                                        onChange={handlePrixTTCChange}
                                        value={prixTTC}
                                    />
                                    {errors.prix_ttc && <span className="text-red-500 text-sm">{errors.prix_ttc.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea {...register('notes')} placeholder="Conditions particulières..." />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {devis ? 'Modifier' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
