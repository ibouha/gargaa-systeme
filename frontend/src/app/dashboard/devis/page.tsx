"use client";

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Search, Pencil, Trash2, FileText,
    Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { DevisDialog } from '@/components/devis/DevisDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { DevisFormValues } from '@/schemas/devis';

// Extended type for display (includes id)
type Devis = DevisFormValues & {
    id: number;
    nom_entite?: string; // from join
    created_at?: string;
};

export default function DevisPage() {
    const [devisList, setDevisList] = useState<Devis[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
    const [deleteDevis, setDeleteDevis] = useState<Devis | null>(null);

    const fetchDevis = useCallback(async () => {
        try {
            setLoading(true);
            const tempParams: Record<string, string> = {}; // No params supported in backend route yet for filters, but ready
            const response = await api.getDevis(tempParams);
            if (response.success && Array.isArray(response.data)) {
                setDevisList(response.data as Devis[]);
            }
        } catch (error) {
            toast.error('Erreur chargement des devis');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDevis();
    }, [fetchDevis]);

    const handleDelete = async () => {
        if (!deleteDevis) return;
        try {
            await api.deleteDevis(deleteDevis.id);
            toast.success('Devis supprimé');
            fetchDevis();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        } finally {
            setDeleteDevis(null);
        }
    };

    const filteredDevis = devisList.filter(d =>
        d.numero_devis.toLowerCase().includes(search.toLowerCase()) ||
        (d.nom_entite && d.nom_entite.toLowerCase().includes(search.toLowerCase()))
    );

    const downloadPdf = (id: number) => {
        const url = api.getDevisPdfUrl(id);
        window.open(url, '_blank');
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'Accepté': return <Badge className="bg-green-600">Accepté</Badge>;
            case 'Refusé': return <Badge className="bg-red-600">Refusé</Badge>;
            case 'Transformé': return <Badge className="bg-blue-600">Transformé</Badge>;
            default: return <Badge className="bg-yellow-600">En attente</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Briefcase className="h-8 w-8" />
                        Gestion des Devis
                    </h1>
                    <p className="text-muted-foreground">Création et suivi des devis clients</p>
                </div>
                <Button onClick={() => { setEditingDevis(null); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Devis
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Devis ({filteredDevis.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex mb-4">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par n° ou client..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>N° Devis</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Trajet</TableHead>
                                        <TableHead>Prix TTC</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDevis.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Aucun devis trouvé.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDevis.map((devis) => (
                                            <TableRow key={devis.id}>
                                                <TableCell className="font-medium">{devis.numero_devis}</TableCell>
                                                <TableCell>{new Date(devis.date_devis).toLocaleDateString('fr-FR')}</TableCell>
                                                <TableCell>{devis.nom_entite || 'Client inconnu'}</TableCell>
                                                <TableCell>{devis.ville_depart} → {devis.ville_arrivee}</TableCell>
                                                <TableCell>{Number(devis.prix_ttc).toFixed(2)} DH</TableCell>
                                                <TableCell>{getStatutBadge(devis.statut)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => downloadPdf(devis.id)} title="Imprimer Devis">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingDevis(devis); setDialogOpen(true); }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteDevis(devis)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DevisDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                devis={editingDevis as (DevisFormValues & { id: number }) | null} // Casting specifically for form compatibility
                onSuccess={fetchDevis}
            />

            <DeleteConfirmDialog
                open={!!deleteDevis}
                onOpenChange={() => setDeleteDevis(null)}
                onConfirm={handleDelete}
                title="Supprimer le devis"
                description={`Êtes-vous sûr de vouloir supprimer le devis "${deleteDevis?.numero_devis}" ?`}
            />
        </div>
    );
}
