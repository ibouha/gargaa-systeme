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
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Search, Pencil, Trash2, FileText,
  Download, Truck, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { ExpeditionDialog } from '@/components/expeditions/ExpeditionDialog';
import { ExpeditionDetailsDialog } from '@/components/expeditions/ExpeditionDetailsDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

interface Expedition {
  id: number;
  client_id: number;
  nom_entite: string;
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
  prix_ttc: number;
  montant_paye: number;
  solde_restant: number;
  statut_paiement: string;
  statut_livraison: string;
  notes?: string;
}

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutPaiement, setStatutPaiement] = useState('all');
  const [statutLivraison, setStatutLivraison] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Expedition | null>(null);
  const [deleteExp, setDeleteExp] = useState<Expedition | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingExp, setViewingExp] = useState<Expedition | null>(null);
  const [clients, setClients] = useState<{ id: number, nom_entite: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState('all');

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await api.getClients({ limit: '1000' });
        if (response.success && Array.isArray(response.data)) {
          setClients(response.data as { id: number, nom_entite: string }[]);
        }
      } catch (error) {
        console.error('Erreur chargement clients:', error);
      }
    };
    loadClients();
  }, []);

  const fetchExpeditions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statutPaiement !== 'all') params.statut_paiement = statutPaiement;
      if (statutLivraison !== 'all') params.statut_livraison = statutLivraison;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;
      if (selectedClient !== 'all') params.client_id = selectedClient;

      const response = await api.getExpeditions(params);
      if (response.success) {
        setExpeditions(response.data as Expedition[]);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [search, statutPaiement, statutLivraison, dateDebut, dateFin, selectedClient]);

  useEffect(() => {
    fetchExpeditions();
  }, [fetchExpeditions]);

  const handleDelete = async () => {
    if (!deleteExp) return;
    try {
      await api.deleteExpedition(deleteExp.id);
      toast.success('Expédition supprimée');
      fetchExpeditions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteExp(null);
    }
  };

  const exportPDF = async () => {
    try {
      const filters: Record<string, unknown> = {};
      if (statutPaiement !== 'all') filters.statut_paiement = statutPaiement;
      if (statutLivraison !== 'all') filters.statut_livraison = statutLivraison;
      if (dateDebut) filters.date_debut = dateDebut;
      if (dateFin) filters.date_fin = dateFin;
      if (selectedClient !== 'all') filters.client_id = selectedClient;

      const blob = await api.exportListePDF(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expeditions_${Date.now()}.pdf`;
      a.click();
      toast.success('Export PDF généré');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const downloadFacture = (id: number) => {
    const url = api.getFactureUrl(id);
    window.open(url, '_blank');
  };

  const getStatutLivraisonBadge = (statut: string) => {
    const colors: Record<string, string> = {
      'Livré': 'bg-green-600',
      'En Transit': 'bg-blue-600',
      'En attente de collecte': 'bg-yellow-600',
      'Annulé': 'bg-gray-600',
    };
    return <Badge className={colors[statut] || 'bg-gray-600'}>{statut}</Badge>;
  };

  const getStatutPaiementBadge = (statut: string, solde: number, livraison: string) => {
    const isAlert = solde > 0 && livraison === 'Livré';
    if (statut === 'Payé') return <Badge className="bg-green-600">Payé</Badge>;
    if (statut === 'Incomplet') return <Badge className={isAlert ? 'bg-red-600 animate-pulse' : 'bg-yellow-600'}>Incomplet</Badge>;
    return <Badge className={isAlert ? 'bg-red-600 animate-pulse' : 'bg-red-600'}>Non Payé</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Gestion des Expéditions
          </h1>
          <p className="text-muted-foreground">Suivi des livraisons</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportPDF} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => { setEditingExp(null); setDialogOpen(true); }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Expédition
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client ou n° expédition..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-1 block">Date début</label>
                <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date fin</label>
                <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Statut Paiement</label>
                <Select value={statutPaiement} onValueChange={setStatutPaiement}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="Payé">Payé</SelectItem>
                    <SelectItem value="Non Payé">Non Payé</SelectItem>
                    <SelectItem value="Incomplet">Incomplet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Statut Livraison</label>
                <Select value={statutLivraison} onValueChange={setStatutLivraison}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="En attente de collecte">En attente</SelectItem>
                    <SelectItem value="En Transit">En Transit</SelectItem>
                    <SelectItem value="Livré">Livré</SelectItem>
                    <SelectItem value="Annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-medium mb-1 block">Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger><SelectValue placeholder="Filtrer par client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.nom_entite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suite dans le prochain fichier... */}
      <ExpeditionsTable
        expeditions={expeditions}
        loading={loading}
        onView={setViewingExp}
        onEdit={(exp) => { setEditingExp(exp); setDialogOpen(true); }}
        onDelete={setDeleteExp}
        onDownloadFacture={downloadFacture}
        getStatutLivraisonBadge={getStatutLivraisonBadge}
        getStatutPaiementBadge={getStatutPaiementBadge}
      />

      <ExpeditionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expedition={editingExp}
        onSuccess={fetchExpeditions}
      />

      <ExpeditionDetailsDialog
        open={!!viewingExp}
        onOpenChange={() => setViewingExp(null)}
        expedition={viewingExp}
        onEdit={(exp) => {
          setViewingExp(null);
          setEditingExp(exp);
          setDialogOpen(true);
        }}
        onDelete={(exp) => {
          setViewingExp(null);
          setDeleteExp(exp);
        }}
        onDownloadInvoice={downloadFacture}
      />

      <DeleteConfirmDialog
        open={!!deleteExp}
        onOpenChange={() => setDeleteExp(null)}
        onConfirm={handleDelete}
        title="Supprimer l'expédition"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteExp?.numero_expedition}" ?`}
      />
    </div>
  );
}

// Composant table extrait
function ExpeditionsTable({ expeditions, loading, onView, onEdit, onDelete, onDownloadFacture, getStatutLivraisonBadge, getStatutPaiementBadge }: {
  expeditions: Expedition[];
  loading: boolean;
  onView: (exp: Expedition) => void;
  onEdit: (exp: Expedition) => void;
  onDelete: (exp: Expedition) => void;
  onDownloadFacture: (id: number) => void;
  getStatutLivraisonBadge: (statut: string) => React.ReactNode;
  getStatutPaiementBadge: (statut: string, solde: number, livraison: string) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Expéditions ({expeditions.length})</CardTitle>
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
                  <TableHead>N° Expédition</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Trajet</TableHead>
                  <TableHead>Prix HT</TableHead>
                  <TableHead>Montant Taxe</TableHead>
                  <TableHead>Prix TTC</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Livraison</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expeditions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Aucune expédition trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  expeditions.map((exp) => {
                    const solde = parseFloat(String(exp.solde_restant));
                    const isAlert = solde > 0 && exp.statut_livraison === 'Livré';
                    const prixHT = parseFloat(String(exp.prix_ht));
                    const prixTTC = parseFloat(String(exp.prix_ttc));
                    const montantTaxe = prixTTC - prixHT;

                    return (
                      <TableRow
                        key={exp.id}
                        className={`${isAlert ? 'bg-red-50 dark:bg-red-950/20' : ''} cursor-pointer hover:bg-muted/50`}
                        onClick={() => onView(exp)}
                      >
                        <TableCell className="font-medium">{exp.numero_expedition}</TableCell>
                        <TableCell>{new Date(exp.date_expedition).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{exp.nom_entite}</TableCell>
                        <TableCell className="text-sm">{exp.ville_depart} → {exp.ville_arrivee}</TableCell>
                        <TableCell>{prixHT.toFixed(2)} DH</TableCell>
                        <TableCell>{montantTaxe.toFixed(2)} DH</TableCell>
                        <TableCell>{prixTTC.toFixed(2)} DH</TableCell>
                        <TableCell>{getStatutPaiementBadge(exp.statut_paiement, solde, exp.statut_livraison)}</TableCell>
                        <TableCell>{getStatutLivraisonBadge(exp.statut_livraison)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => onDownloadFacture(exp.id)} title="Facture">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(exp)} title="Modifier">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(exp)} title="Supprimer">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

