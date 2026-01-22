import { Edit, Building2, Briefcase, Star, PoundSterling, Tag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Consultant } from '@/types/contacts';

interface ConsultantDetailProps {
  consultant: Consultant | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (consultant: Consultant) => void;
}

export default function ConsultantDetail({ consultant, isOpen, onClose, onEdit }: ConsultantDetailProps) {
  if (!consultant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={consultant.company?.name || consultant.contact?.full_name || 'Consultant Details'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(consultant);
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
        {consultant.company && (
          <div className="border-b pb-4">
            <div>
              <h3 className="font-semibold mb-2">{consultant.company.name}</h3>
              {consultant.company.email && <p className="text-sm text-muted-foreground">Email: {consultant.company.email}</p>}
              {consultant.company.phone && <p className="text-sm text-muted-foreground">Phone: {consultant.company.phone}</p>}
            </div>
          </div>
        )}

        {consultant.contact && (
          <div className="border-b pb-4">
            <div>
              <h3 className="font-semibold mb-2">
                {consultant.contact.full_name || `${consultant.contact.first_name} ${consultant.contact.last_name}`}
              </h3>
              {consultant.contact.email && <p className="text-sm text-muted-foreground">Email: {consultant.contact.email}</p>}
              {consultant.contact.phone && <p className="text-sm text-muted-foreground">Phone: {consultant.contact.phone}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Consultant Information
            </h3>
            <div className="space-y-2 text-sm">
              {consultant.consultant_type && (
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <Badge variant="outline">{consultant.consultant_type}</Badge>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Availability: </span>
                <Badge variant="outline">{consultant.availability_status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={consultant.relationship_status === 'active' ? 'default' : 'outline'}>
                  {consultant.relationship_status}
                </Badge>
              </div>
              {consultant.typical_response_time && (
                <p>
                  <span className="text-muted-foreground">Response Time: </span>
                  {consultant.typical_response_time}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <PoundSterling className="h-4 w-4" />
              Rates & Performance
            </h3>
            <div className="space-y-2 text-sm">
              {consultant.hourly_rate && (
                <p>
                  <span className="text-muted-foreground">Hourly Rate: </span>
                  £{consultant.hourly_rate.toFixed(2)}/hr
                </p>
              )}
              {consultant.daily_rate && (
                <p>
                  <span className="text-muted-foreground">Daily Rate: </span>
                  £{consultant.daily_rate.toFixed(2)}/day
                </p>
              )}
              {consultant.rating && (
                <p>
                  <span className="text-muted-foreground">Rating: </span>
                  {consultant.rating.toFixed(1)}/5.0
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Projects Completed: </span>
                {consultant.total_projects_completed}
              </p>
            </div>
          </div>
        </div>

        {consultant.specializations && consultant.specializations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {consultant.specializations.map((spec, idx) => (
                <Badge key={idx} variant="outline">{spec}</Badge>
              ))}
            </div>
          </div>
        )}

        {consultant.notes && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{consultant.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
