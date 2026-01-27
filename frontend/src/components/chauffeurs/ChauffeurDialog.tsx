import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  nom_complet: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  adresse: z.string().optional(),
  permis: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Chauffeur {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse?: string;
  permis?: string;
}

interface ChauffeurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chauffeur?: Chauffeur | null;
  onSuccess: () => void;
}

export function ChauffeurDialog({ 
  open, 
  onOpenChange, 
  chauffeur, 
  onSuccess 
}: ChauffeurDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom_complet: '',
      telephone: '',
      adresse: '',
      permis: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (chauffeur) {
        reset({
          nom_complet: chauffeur.nom_complet,
          telephone: chauffeur.telephone,
          adresse: chauffeur.adresse || '',
          permis: chauffeur.permis || '',
        });
      } else {
        reset({
          nom_complet: '',
          telephone: '',
          adresse: '',
          permis: '',
        });
      }
    }
  }, [open, chauffeur, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (chauffeur) {
        await api.updateChauffeur(chauffeur.id, data);
        toast.success('Chauffeur modifié avec succès');
      } else {
        await api.createChauffeur(data);
        toast.success('Chauffeur créé avec succès');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {chauffeur ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom complet</Label>
            <Input id="nom" {...register('nom_complet')} />
            {errors.nom_complet && (
              <p className="text-sm text-red-500">{errors.nom_complet.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" {...register('telephone')} />
            {errors.telephone && (
              <p className="text-sm text-red-500">{errors.telephone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="permis">Numéro de Permis</Label>
            <Input id="permis" {...register('permis')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea id="adresse" {...register('adresse')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
