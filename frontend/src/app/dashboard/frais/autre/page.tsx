'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, MoreHorizontal } from 'lucide-react';
import { FraisDialog } from '@/components/frais/FraisDialog';
import { FraisFilters } from '@/components/frais/FraisFilters';
import { FraisTable } from '@/components/frais/FraisTable';
import { FraisStats } from '@/components/frais/FraisStats';

export default function FraisAutrePage() {
  const [frais, setFrais] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFrais, setEditingFrais] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    categorie_id: '',
    mode_paiement: '',
    page: 1,
    limit: 20
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getCategoriesFrais({ type_categorie: 'Autre' });
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  }, []);

  const fetchFrais = useCallback(async () => {
    try {
      setLoading(true);
      const currentFilters: any = { ...filters, type_categorie: 'Autre' };
      
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] === '' || currentFilters[key] === null) {
          delete currentFilters[key];
        }
      });

      const response = await api.getFrais(currentFilters);
      if (response.success) {
        setFrais(response.data);
        setPagination(response.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
      }
    } catch (error) {
      console.error('Erreur chargement frais:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const currentFilters: any = { type_categorie: 'Autre' };
      if (filters.date_debut) currentFilters.date_debut = filters.date_debut;
      if (filters.date_fin) currentFilters.date_fin = filters.date_fin;

      const response = await api.getFraisStats(currentFilters);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }, [filters.date_debut, filters.date_fin]);

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
      const currentFilters: any = { ...filters, type_categorie: 'Autre' };
      
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] === '' || currentFilters[key] === null) {
          delete currentFilters[key];
        }
      });

      const blob = await api.exportFraisPDF(currentFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autres_frais_${new Date().toISOString().split('T')[0]}.pdf`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MoreHorizontal className="h-8 w-8 text-gray-600" />
            Autres Frais
          </h1>
          <p className="text-muted-foreground">
            Gérez les autres dépenses (frais bancaires, taxes, assurances, etc.)
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

      <FraisStats stats={stats} loading={loading} />

      <FraisFilters
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        activeTab="Autre"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
            Liste des Autres Frais
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
            hideTypeColumn={true}
          />
        </CardContent>
      </Card>

      <FraisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        frais={editingFrais}
        categories={categories}
        onSave={handleSaveFrais}
        fixedType="Autre"
      />
    </div>
  );
}
