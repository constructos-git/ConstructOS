import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, MoreVertical, Edit, Trash2, Eye, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Contact, Company } from '@/types/contacts';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
  onView?: (contact: Contact) => void;
}

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  onView,
}: ContactCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(contact);
  };

  const formatAddress = () => {
    const parts = [
      contact.address_line1,
      contact.address_line2,
      contact.town_city,
      contact.county,
      contact.postcode,
    ].filter(Boolean);
    return parts.join(', ') || 'No address';
  };

  return (
    <Card
      className={cn(
        'relative transition-all cursor-pointer hover:shadow-md',
        contact.status === 'inactive' && 'opacity-60',
        contact.status === 'archived' && 'opacity-40'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-foreground hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer truncate"
              onClick={handleTitleClick}
            >
              {contact.full_name || `${contact.first_name} ${contact.last_name}`}
            </h3>
            {contact.job_title && (
              <p className="text-sm text-muted-foreground truncate">{contact.job_title}</p>
            )}
            {contact.company && (
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" />
                {contact.company.name}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={contact.status === 'active' ? 'default' : 'outline'}>
              {contact.status}
            </Badge>
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            >
              {onView && (
                <button
                  onClick={() => onView(contact)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent rounded-md"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(contact)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent rounded-md"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(contact.id)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-accent rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </Dropdown>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 text-sm">
          {contact.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.mobile && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>M: {contact.mobile}</span>
            </div>
          )}
          {(contact.address_line1 || contact.town_city) && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{formatAddress()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {contact.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>{contact.type}</span>
          {contact.is_primary_contact && (
            <Badge variant="outline" className="text-xs">Primary</Badge>
          )}
          {contact.is_decision_maker && (
            <Badge variant="outline" className="text-xs">Decision Maker</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
