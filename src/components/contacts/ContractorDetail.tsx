import { Edit, Building2, Wrench, Star, PoundSterling, Tag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Contractor } from '@/types/contacts';

interface ContractorDetailProps {
  contractor: Contractor | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contractor: Contractor) => void;
}

export default function ContractorDetail({ contractor, isOpen, onClose, onEdit }: ContractorDetailProps) {
  if (!contractor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contractor.company?.name || 'Contractor Details'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(contractor);
                onClose();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {contractor.company && (
          <div className="border-b pb-4">
            <div>
              <h3 className="font-semibold mb-2">{contractor.company.name}</h3>
              {contractor.company.email && <p className="text-sm text-muted-foreground">Email: {contractor.company.email}</p>}
              {contractor.company.phone && <p className="text-sm text-muted-foreground">Phone: {contractor.company.phone}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Trade Information
            </h3>
            <div className="space-y-2 text-sm">
              {contractor.trade_types && contractor.trade_types.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Trades: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contractor.trade_types.map((trade, idx) => (
                      <Badge key={idx} variant="outline">{trade}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Availability: </span>
                <Badge variant="outline">{contractor.availability_status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={contractor.relationship_status === 'active' ? 'default' : 'outline'}>
                  {contractor.relationship_status}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Performance
            </h3>
            <div className="space-y-2 text-sm">
              {contractor.rating && (
                <p>
                  <span className="text-muted-foreground">Rating: </span>
                  {contractor.rating.toFixed(1)}/5.0
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Projects Completed: </span>
                {contractor.total_projects_completed}
              </p>
              {contractor.on_time_completion_rate && (
                <p>
                  <span className="text-muted-foreground">On-Time Rate: </span>
                  {contractor.on_time_completion_rate}%
                </p>
              )}
              {contractor.quality_rating && (
                <p>
                  <span className="text-muted-foreground">Quality Rating: </span>
                  {contractor.quality_rating.toFixed(1)}/5.0
                </p>
              )}
            </div>
          </div>
        </div>

        {contractor.certifications && contractor.certifications.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {contractor.certifications.map((cert, idx) => (
                <Badge key={idx} variant="outline">{cert}</Badge>
              ))}
            </div>
          </div>
        )}

        {contractor.notes && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contractor.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
