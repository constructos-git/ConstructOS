import { Edit, Mail, Phone, MapPin, Building2, Globe, Tag, PoundSterling } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Company } from '@/types/contacts';

interface CompanyDetailProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (company: Company) => void;
}

export default function CompanyDetail({ company, isOpen, onClose, onEdit }: CompanyDetailProps) {
  if (!company) return null;

  const formatAddress = () => {
    const parts = [
      company.address_line1,
      company.address_line2,
      company.address_line3,
      company.town_city,
      company.county,
      company.postcode,
    ].filter(Boolean);
    return parts.join(', ') || 'No address provided';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company.name}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(company);
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
        <div>
          <h2 className="text-2xl font-bold">{company.name}</h2>
          {company.legal_name && company.legal_name !== company.name && (
            <p className="text-muted-foreground mt-1">Legal Name: {company.legal_name}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={company.status === 'active' ? 'default' : 'outline'}>
            {company.status}
          </Badge>
          <Badge variant="outline">{company.type}</Badge>
          {company.industry && <Badge variant="outline">{company.industry}</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${company.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${company.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {company.phone}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {company.website}
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

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <PoundSterling className="h-4 w-4" />
              Business Details
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              {company.company_number && <p>Company Number: {company.company_number}</p>}
              {company.vat_number && <p>VAT Number: {company.vat_number}</p>}
              {company.employee_count && <p>Employees: {company.employee_count}</p>}
              {company.payment_terms && <p>Payment Terms: {company.payment_terms}</p>}
              {company.credit_limit && <p>Credit Limit: £{company.credit_limit.toLocaleString()}</p>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">Additional Information</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              {company.sector && <p>Sector: {company.sector}</p>}
              {company.established_year && <p>Established: {company.established_year}</p>}
              {company.currency && <p>Currency: {company.currency}</p>}
            </div>
          </div>
        </div>

        {company.tags && company.tags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {company.notes && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{company.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
