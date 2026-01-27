'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileDown, TrendingDown } from 'lucide-react';
import { FraisDialog } from '@/components/frais/FraisDialog';
import { FraisFilters } from '@/components/frais/FraisFilters';
import { FraisTable } from '@/components/frais/FraisTable';
import { FraisStats } from '@/components/frais/FraisStats';

export default function FraisPage() {
  const [frais, setFrais] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFrais, setEditingFrais] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('all'); // Type filter

  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    categorie_id: '',
    numero_camion: '',
    mode_paiement: '',
    page: 1,
    limit: 20
  });

  const fetchCategories = useCallback(async () => {
    try {
      // Fetch all categories or filter by type if selected
      const params = selectedType !== 'all' ? { type_categorie: selectedType } : {};
      const response = await api.getCategoriesFrais(params);
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  }, [selectedType]);

  const fetchFrais = useCallback(async () => {
    try {
      setLoading(true);
      const currentFilters: Record<string, string> = {};

      // Add type filter if not 'all'
      if (selectedType !== 'all') {
        currentFilters.type_categorie = selectedType;
      }

      // Add other filters
      if (filters.date_debut) currentFilters.date_debut = filters.date_debut;
      if (filters.date_fin) currentFilters.date_fin = filters.date_fin;
      if (filters.categorie_id) currentFilters.categorie_id = filters.categorie_id;
      if (filters.numero_camion) currentFilters.numero_camion = filters.numero_camion;
      if (filters.mode_paiement) currentFilters.mode_paiement = filters.mode_paiement;
      currentFilters.page = filters.page.toString();
      currentFilters.limit = filters.limit.toString();

      console.log('🔍 Fetching frais with filters:', currentFilters);

      const response = await api.getFrais(currentFilters);

      console.log('📊 Received frais data:', response.data?.length, 'items');

      if (response.success) {
        setFrais(response.data || []);
        setPagination(response.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
      }
    } catch (error) {
      console.error('Erreur chargement frais:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedType]);

  const fetchStats = useCallback(async () => {
    try {
      const currentFilters: Record<string, string> = {};
      if (selectedType !== 'all') currentFilters.type_categorie = selectedType;
      if (filters.date_debut) currentFilters.date_debut = filters.date_debut;
      if (filters.date_fin) currentFilters.date_fin = filters.date_fin;

      const response = await api.getFraisStats(currentFilters);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }, [filters.date_debut, filters.date_fin, selectedType]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchFrais();
    fetchStats();
  }, [fetchFrais, fetchStats]);

  const handleSaveFrais = async (data: any) => {
    try {
      if (editingFrais) {
        await api.updateFrais(editingFrais.id, data);
      } else {
        await api.createFrais(data);
      }
      setDialogOpen(false);
      setEditingFrais(null);
      fetchFrais();
      fetchStats();
    } catch (error) {
      console.error('Erreur sauvegarde frais:', error);
      throw error;
    }
  };

  const handleDeleteFrais = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce frais ?')) return;

    try {
      await api.deleteFrais(id);
      fetchFrais();
      fetchStats();
    } catch (error) {
      console.error('Erreur suppression frais:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const currentFilters: Record<string, string> = {};

      if (selectedType !== 'all') {
        currentFilters.type_categorie = selectedType;
      }
      if (filters.date_debut) currentFilters.date_debut = filters.date_debut;
      if (filters.date_fin) currentFilters.date_fin = filters.date_fin;
      if (filters.categorie_id) currentFilters.categorie_id = filters.categorie_id;
      if (filters.numero_camion) currentFilters.numero_camion = filters.numero_camion;
      if (filters.mode_paiement) currentFilters.mode_paiement = filters.mode_paiement;

      const blob = await api.exportFraisPDF(currentFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frais_export_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Frais</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos dépenses (Magasin, Camion, Autres)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
          <Button onClick={() => { setEditingFrais(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Frais
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <FraisStats stats={stats} loading={loading} />

      {/* Type Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs space-y-2">
              <Label>Type de Frais</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Magasin">Frais Magasin</SelectItem>
                  <SelectItem value="Camion">Frais Camion</SelectItem>
                  <SelectItem value="Autre">Autres Frais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <FraisFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        activeTab={selectedType === 'all' ? 'Tous' : selectedType}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Note de Frais
            {selectedType !== 'all' && ` - ${selectedType}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FraisTable
            frais={frais}
            loading={loading}
            pagination={pagination}
            onPageChange={(page: number) => setFilters({ ...filters, page })}
            onEdit={(f: any) => { setEditingFrais(f); setDialogOpen(true); }}
            onDelete={handleDeleteFrais}
            hideTypeColumn={selectedType !== 'all'}
            hideTruckColumn={selectedType === 'Magasin' || selectedType === 'Autre'}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <FraisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        frais={editingFrais}
        categories={categories}
        onSave={handleSaveFrais}
        fixedType={selectedType !== 'all' ? (selectedType as 'Magasin' | 'Camion' | 'Autre') : undefined}
      />
    </div>
  );
}
