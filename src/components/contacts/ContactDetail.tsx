import { Edit, Mail, Phone, MapPin, Building2, Calendar, Tag, User } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Contact } from '@/types/contacts';

interface ContactDetailProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
}

export default function ContactDetail({ contact, isOpen, onClose, onEdit }: ContactDetailProps) {
  if (!contact) return null;

  const formatAddress = () => {
    const parts = [
      contact.address_line1,
      contact.address_line2,
      contact.address_line3,
      contact.town_city,
      contact.county,
      contact.postcode,
    ].filter(Boolean);
    return parts.join(', ') || 'No address provided';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact.full_name || `${contact.first_name} ${contact.last_name}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(contact);
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
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">
            {contact.full_name || `${contact.first_name} ${contact.last_name}`}
          </h2>
          {contact.job_title && <p className="text-muted-foreground mt-1">{contact.job_title}</p>}
          {contact.company && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {contact.company.name}
            </p>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={contact.status === 'active' ? 'default' : 'outline'}>
            {contact.status}
          </Badge>
          <Badge variant="outline">{contact.type}</Badge>
          {contact.is_primary_contact && <Badge variant="outline">Primary Contact</Badge>}
          {contact.is_decision_maker && <Badge variant="outline">Decision Maker</Badge>}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.mobile}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    Mobile: {contact.mobile}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </h3>
            <p className="text-sm text-muted-foreground">{formatAddress()}</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-6">
          {contact.department && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Department</h3>
              <p className="text-sm text-muted-foreground">{contact.department}</p>
            </div>
          )}
          {contact.preferred_contact_method && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Preferred Contact Method</h3>
              <p className="text-sm text-muted-foreground">{contact.preferred_contact_method}</p>
            </div>
          )}
          {contact.birthday && (
            <div>
              <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Birthday
              </h3>
              <p className="text-sm text-muted-foreground">{contact.birthday}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
