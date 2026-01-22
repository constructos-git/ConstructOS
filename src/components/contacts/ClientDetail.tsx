import { Edit, Building2, PoundSterling, Calendar, Tag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Client } from '@/types/contacts';

interface ClientDetailProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (client: Client) => void;
}

export default function ClientDetail({ client, isOpen, onClose, onEdit }: ClientDetailProps) {
  if (!client) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client.company?.name || 'Client Details'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(client);
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
        {client.company && (
          <div className="border-b pb-4">
            <div>
              <h3 className="font-semibold mb-2">{client.company.name}</h3>
              {client.company.email && <p className="text-sm text-muted-foreground">Email: {client.company.email}</p>}
              {client.company.phone && <p className="text-sm text-muted-foreground">Phone: {client.company.phone}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Client Information
            </h3>
            <div className="space-y-2 text-sm">
              {client.client_type && (
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <Badge variant="outline">{client.client_type}</Badge>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant={client.relationship_status === 'active' ? 'default' : 'outline'}>
                  {client.relationship_status}
                </Badge>
              </div>
              {client.preferred_communication_method && (
                <p>
                  <span className="text-muted-foreground">Preferred Communication: </span>
                  {client.preferred_communication_method}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <PoundSterling className="h-4 w-4" />
              Financial Information
            </h3>
            <div className="space-y-2 text-sm">
              {client.average_project_value && (
                <p>
                  <span className="text-muted-foreground">Avg Project Value: </span>
                  £{client.average_project_value.toLocaleString()}
                </p>
              )}
              {client.credit_limit && (
                <p>
                  <span className="text-muted-foreground">Credit Limit: </span>
                  £{client.credit_limit.toLocaleString()}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Outstanding Balance: </span>
                <span className={client.outstanding_balance > 0 ? 'text-destructive' : ''}>
                  £{client.outstanding_balance.toLocaleString()}
                </span>
              </p>
              {client.payment_terms && (
                <p>
                  <span className="text-muted-foreground">Payment Terms: </span>
                  {client.payment_terms}
                </p>
              )}
            </div>
          </div>
        </div>

        {client.project_types && client.project_types.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Project Types</h3>
            <div className="flex flex-wrap gap-2">
              {client.project_types.map((type, idx) => (
                <Badge key={idx} variant="outline">{type}</Badge>
              ))}
            </div>
          </div>
        )}

        {client.notes && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
