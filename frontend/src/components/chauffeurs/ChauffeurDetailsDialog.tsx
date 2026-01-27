import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Phone, MapPin, User, FileText, Calendar } from 'lucide-react';

interface Chauffeur {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse?: string;
  permis?: string;
  date_ajout: string;
}

interface ChauffeurDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chauffeur: Chauffeur | null;
  onEdit: (chauffeur: Chauffeur) => void;
  onDelete: (chauffeur: Chauffeur) => void;
}

export function ChauffeurDetailsDialog({
  open,
  onOpenChange,
  chauffeur,
  onEdit,
  onDelete,
}: ChauffeurDetailsDialogProps) {
  if (!chauffeur) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du Chauffeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{chauffeur.nom_complet}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                <span>{chauffeur.telephone}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t pt-4">
            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Numéro de Permis</p>
                <p className="text-muted-foreground">{chauffeur.permis || 'Non renseigné'}</p>
              </div>
            </div>

            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-muted-foreground">{chauffeur.adresse || 'Non renseignée'}</p>
              </div>
            </div>

            <div className="grid grid-cols-[24px_1fr] items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Date d'ajout</p>
                <p className="text-muted-foreground">
                  {new Date(chauffeur.date_ajout).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onEdit(chauffeur)}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="destructive" onClick={() => onDelete(chauffeur)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
