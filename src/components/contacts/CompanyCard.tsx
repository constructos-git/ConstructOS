import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, MoreVertical, Edit, Trash2, Eye, Tag, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Company } from '@/types/contacts';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (id: string) => void;
  onView?: (company: Company) => void;
}

export default function CompanyCard({
  company,
  onEdit,
  onDelete,
  onView,
}: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.(company);
  };

  const formatAddress = () => {
    const parts = [
      company.address_line1,
      company.address_line2,
      company.town_city,
      company.county,
      company.postcode,
    ].filter(Boolean);
    return parts.join(', ') || 'No address';
  };

  return (
    <Card
      className={cn(
        'relative transition-all cursor-pointer hover:shadow-md',
        company.status === 'inactive' && 'opacity-60',
        company.status === 'archived' && 'opacity-40'
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
              {company.name}
            </h3>
            {company.legal_name && company.legal_name !== company.name && (
              <p className="text-sm text-muted-foreground truncate">{company.legal_name}</p>
            )}
            {company.industry && (
              <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={company.status === 'active' ? 'default' : 'outline'}>
              {company.status}
            </Badge>
            <Badge variant="outline">{company.type}</Badge>
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            >
              {onView && (
                <button
                  onClick={() => onView(company)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent rounded-md"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(company)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent rounded-md"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(company.id)}
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
          {company.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{company.phone}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary-600 dark:hover:text-primary-400"
                onClick={(e) => e.stopPropagation()}
              >
                {company.website}
              </a>
            </div>
          )}
          {(company.address_line1 || company.town_city) && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{formatAddress()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {company.tags && company.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {company.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {company.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{company.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          {company.employee_count && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{company.employee_count}</span>
            </div>
          )}
          {company.vat_number && (
            <span>VAT: {company.vat_number}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
