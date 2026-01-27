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
import { 
  Plus, Search, Pencil, Trash2, User
} from 'lucide-react';
import { toast } from 'sonner';
import { ChauffeurDialog } from '@/components/chauffeurs/ChauffeurDialog';
import { ChauffeurDetailsDialog } from '@/components/chauffeurs/ChauffeurDetailsDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

interface Chauffeur {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse?: string;
  permis?: string;
  date_ajout: string;
}

export default function ChauffeursPage() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);
  const [viewingChauffeur, setViewingChauffeur] = useState<Chauffeur | null>(null);
  const [deleteChauffeur, setDeleteChauffeur] = useState<Chauffeur | null>(null);

  const fetchChauffeurs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      
      const response = await api.getChauffeurs(params);
      if (response.success) {
        setChauffeurs(response.data as Chauffeur[]);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des chauffeurs');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchChauffeurs();
  }, [fetchChauffeurs]);

  const handleDelete = async () => {
    if (!deleteChauffeur) return;
    try {
      await api.deleteChauffeur(deleteChauffeur.id);
      toast.success('Chauffeur supprimé avec succès');
      fetchChauffeurs();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteChauffeur(null);
    }
  };

  const openEdit = (chauffeur: Chauffeur) => {
    setEditingChauffeur(chauffeur);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingChauffeur(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Gestion des Chauffeurs
          </h1>
          <p className="text-muted-foreground">Répertoire des chauffeurs</p>
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un chauffeur
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Chauffeurs ({chauffeurs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom Complet</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Permis</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Date d&apos;ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chauffeurs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun chauffeur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    chauffeurs.map((chauffeur) => (
                      <TableRow 
                        key={chauffeur.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setViewingChauffeur(chauffeur)}
                      >
                        <TableCell className="font-medium">{chauffeur.nom_complet}</TableCell>
                        <TableCell>{chauffeur.telephone}</TableCell>
                        <TableCell>{chauffeur.permis || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{chauffeur.adresse || '-'}</TableCell>
                        <TableCell>{new Date(chauffeur.date_ajout).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(chauffeur)} title="Modifier">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteChauffeur(chauffeur)} title="Supprimer">
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

      <ChauffeurDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        chauffeur={editingChauffeur}
        onSuccess={fetchChauffeurs}
      />

      <ChauffeurDetailsDialog
        open={!!viewingChauffeur}
        onOpenChange={() => setViewingChauffeur(null)}
        chauffeur={viewingChauffeur}
        onEdit={(chauffeur) => {
          setViewingChauffeur(null);
          setEditingChauffeur(chauffeur);
          setDialogOpen(true);
        }}
        onDelete={(chauffeur) => {
          setViewingChauffeur(null);
          setDeleteChauffeur(chauffeur);
        }}
      />
      
      <DeleteConfirmDialog
        open={!!deleteChauffeur}
        onOpenChange={() => setDeleteChauffeur(null)}
        onConfirm={handleDelete}
        title="Supprimer le chauffeur"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteChauffeur?.nom_complet}" ?`}
      />
    </div>
  );
}
