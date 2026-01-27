"use client";

import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, MapPin, Truck, User, Phone, 
  Package, DollarSign, FileText, Pencil, Trash2, Download
} from 'lucide-react';

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

interface ExpeditionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedition: Expedition | null;
  onEdit?: (expedition: Expedition) => void;
  onDelete?: (expedition: Expedition) => void;
  onDownloadInvoice?: (id: number) => void;
}

export function ExpeditionDetailsDialog({ 
  open, 
  onOpenChange, 
  expedition,
  onEdit,
  onDelete,
  onDownloadInvoice
}: ExpeditionDetailsDialogProps) {
  if (!expedition) return null;

  const montantTaxe = expedition.prix_ttc - expedition.prix_ht;
  const solde = parseFloat(String(expedition.solde_restant));

  const getStatutLivraisonBadge = (statut: string) => {
    const colors: Record<string, string> = {
      'Livré': 'bg-green-600',
      'En Transit': 'bg-blue-600',
      'En attente de collecte': 'bg-yellow-600',
      'Annulé': 'bg-gray-600',
    };
    return <Badge className={colors[statut] || 'bg-gray-600'}>{statut}</Badge>;
  };

  const getStatutPaiementBadge = (statut: string) => {
    if (statut === 'Payé') return <Badge className="bg-green-600">Payé</Badge>;
    if (statut === 'Incomplet') return <Badge className="bg-yellow-600">Incomplet</Badge>;
    return <Badge className="bg-red-600">Non Payé</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails de l'expédition
          </DialogTitle>
          <DialogDescription>
            {expedition.numero_expedition}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Reference Section */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              RÉFÉRENCE
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{expedition.nom_entite}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'expédition</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(expedition.date_expedition).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Logistics Section */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              LOGISTIQUE
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ville de départ</p>
                <p className="font-medium">{expedition.ville_depart}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ville d'arrivée</p>
                <p className="font-medium">{expedition.ville_arrivee}</p>
              </div>
              {expedition.type_marchandises && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Type de marchandises</p>
                  <p className="font-medium flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {expedition.type_marchandises}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Transport Section */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              TRANSPORT
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {expedition.type_camion && (
                <div>
                  <p className="text-sm text-muted-foreground">Type de camion</p>
                  <p className="font-medium">{expedition.type_camion}</p>
                </div>
              )}
              {expedition.numero_camion && (
                <div>
                  <p className="text-sm text-muted-foreground">N° Camion</p>
                  <p className="font-medium">{expedition.numero_camion}</p>
                </div>
              )}
              {expedition.nom_chauffeur && (
                <div>
                  <p className="text-sm text-muted-foreground">Chauffeur</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {expedition.nom_chauffeur}
                  </p>
                </div>
              )}
              {expedition.telephone_chauffeur && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone chauffeur</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {expedition.telephone_chauffeur}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Financial Section */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              FINANCIER
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Prix HT</p>
                <p className="font-medium">{parseFloat(String(expedition.prix_ht)).toFixed(2)} DH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux TVA</p>
                <p className="font-medium">{expedition.taux_tva}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant Taxe</p>
                <p className="font-medium">{montantTaxe.toFixed(2)} DH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prix TTC</p>
                <p className="font-medium text-lg">{parseFloat(String(expedition.prix_ttc)).toFixed(2)} DH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant payé</p>
                <p className="font-medium">{parseFloat(String(expedition.montant_paye)).toFixed(2)} DH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solde restant</p>
                <p className={`font-medium text-lg ${solde > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {solde.toFixed(2)} DH
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Section */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">STATUT</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Paiement</p>
                {getStatutPaiementBadge(expedition.statut_paiement)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Livraison</p>
                {getStatutLivraisonBadge(expedition.statut_livraison)}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {expedition.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">NOTES</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{expedition.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-4 border-t">
          {onDownloadInvoice && (
            <Button 
              variant="outline" 
              onClick={() => {
                onDownloadInvoice(expedition.id);
                onOpenChange(false);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger Facture
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="default" 
              onClick={() => {
                onEdit(expedition);
                onOpenChange(false);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(expedition);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
