"use client";

import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Phone, Mail, MapPin, FileText, 
  Building2, Pencil, Trash2, History
} from 'lucide-react';

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

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onViewHistory?: (clientId: number) => void;
}

export function ClientDetailsDialog({ 
  open, 
  onOpenChange, 
  client,
  onEdit,
  onDelete,
  onViewHistory
}: ClientDetailsDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {client.type_client === 'Entreprise' ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            Détails du client
          </DialogTitle>
          <DialogDescription>
            {client.nom_entite}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Type & Basic Info */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              INFORMATIONS GÉNÉRALES
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type de client</p>
                <Badge variant={client.type_client === 'Entreprise' ? 'default' : 'secondary'}>
                  {client.type_client}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'ajout</p>
                <p className="font-medium">
                  {new Date(client.date_ajout).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              CONTACT
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {client.numero_telephone}
                </p>
              </div>
              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ADRESSE
            </h3>
            <p className="font-medium">{client.adresse_complete}</p>
          </div>

          {/* ICE (if available) */}
          {client.ice && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  IDENTIFICATION
                </h3>
                <div>
                  <p className="text-sm text-muted-foreground">ICE</p>
                  <p className="font-medium text-lg">{client.ice}</p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {client.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">NOTES</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{client.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-4 border-t">
          {onViewHistory && (
            <Button 
              variant="outline" 
              onClick={() => {
                onViewHistory(client.id);
                onOpenChange(false);
              }}
            >
              <History className="h-4 w-4 mr-2" />
              Historique
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="default" 
              onClick={() => {
                onEdit(client);
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
                onDelete(client);
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
