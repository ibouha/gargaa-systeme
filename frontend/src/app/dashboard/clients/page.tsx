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
  Plus, Search, Pencil, Trash2, History, Users 
} from 'lucide-react';
import { toast } from 'sonner';
import { ClientDialog } from '@/components/clients/ClientDialog';
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { ClientHistoryDialog } from '@/components/clients/ClientHistoryDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

interface Client {
  id: number;
  type_client: 'Entreprise' | 'Particulier';
  nom_entite: string;
  numero_telephone: string;
  adresse_complete: string;
  email?: string;
  ice?: string;
  notes?: string;
  date_ajout: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter !== 'all') params.type_client = typeFilter;
      
      const response = await api.getClients(params);
      if (response.success) {
        setClients(response.data as Client[]);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async () => {
    if (!deleteClient) return;
    try {
      await api.deleteClient(deleteClient.id);
      toast.success('Client supprimé avec succès');
      fetchClients();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteClient(null);
    }
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestion des Clients
          </h1>
          <p className="text-muted-foreground">Répertoire des clients</p>
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un nouveau client
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type de client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Entreprise">Entreprise</SelectItem>
                <SelectItem value="Particulier">Particulier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Clients ({clients.length})</CardTitle>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Date d&apos;ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow 
                      key={client.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewingClient(client)}
                    >
                      <TableCell>
                        <Badge variant={client.type_client === 'Entreprise' ? 'default' : 'secondary'}>
                          {client.type_client}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{client.nom_entite}</TableCell>
                      <TableCell>{client.numero_telephone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{client.adresse_complete}</TableCell>
                      <TableCell>{new Date(client.date_ajout).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => setHistoryClient(client)} title="Historique">
                            <History className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(client)} title="Modifier">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteClient(client)} title="Supprimer">
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

      <ClientDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSuccess={fetchClients}
      />

      <ClientDetailsDialog
        open={!!viewingClient}
        onOpenChange={() => setViewingClient(null)}
        client={viewingClient}
        onEdit={(client) => {
          setViewingClient(null);
          setEditingClient(client);
          setDialogOpen(true);
        }}
        onDelete={(client) => {
          setViewingClient(null);
          setDeleteClient(client);
        }}
        onViewHistory={(clientId) => {
          const client = clients.find(c => c.id === clientId);
          if (client) {
            setViewingClient(null);
            setHistoryClient(client);
          }
        }}
      />
      
      <ClientHistoryDialog
        client={historyClient}
        onClose={() => setHistoryClient(null)}
      />

      <DeleteConfirmDialog
        open={!!deleteClient}
        onOpenChange={() => setDeleteClient(null)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteClient?.nom_entite}" ?`}
      />
    </div>
  );
}

