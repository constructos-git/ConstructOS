import { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useContactsStore } from '@/stores/contactsStore';
import { useClientsStore } from '@/stores/clientsStore';
import { useContractorsStore } from '@/stores/contractorsStore';
import { useConsultantsStore } from '@/stores/consultantsStore';

interface ContactSelectorProps {
  label?: string;
  value?: string;
  onChange: (contactId: string, contactType: 'company' | 'contact' | 'client' | 'contractor' | 'consultant', name: string) => void;
  type?: 'all' | 'company' | 'contact' | 'client' | 'contractor' | 'consultant';
  companyId?: string; // Filter contacts by company
  required?: boolean;
}

export default function ContactSelector({
  label = 'Contact',
  value,
  onChange,
  type = 'all',
  companyId,
  required = false,
}: ContactSelectorProps) {
  const { companies, fetchCompanies } = useCompaniesStore();
  const { contacts, fetchContacts } = useContactsStore();
  const { clients, fetchClients } = useClientsStore();
  const { contractors, fetchContractors } = useContractorsStore();
  const { consultants, fetchConsultants } = useConsultantsStore();

  const [options, setOptions] = useState<{ value: string; label: string; type: string }[]>([]);

  useEffect(() => {
    if (type === 'all' || type === 'company') fetchCompanies();
    if (type === 'all' || type === 'contact') fetchContacts();
    if (type === 'all' || type === 'client') fetchClients();
    if (type === 'all' || type === 'contractor') fetchContractors();
    if (type === 'all' || type === 'consultant') fetchConsultants();
  }, [type, fetchCompanies, fetchContacts, fetchClients, fetchContractors, fetchConsultants]);

  useEffect(() => {
    const opts: { value: string; label: string; type: string }[] = [];

    if (type === 'all' || type === 'company') {
      companies.forEach((c) => {
        opts.push({ value: `company:${c.id}`, label: `Company: ${c.name}`, type: 'company' });
      });
    }

    if (type === 'all' || type === 'contact') {
      const filteredContacts = companyId
        ? contacts.filter((c) => c.company_uuid === companyId)
        : contacts;
      filteredContacts.forEach((c) => {
        opts.push({
          value: `contact:${c.id}`,
          label: `Contact: ${c.first_name} ${c.last_name}${c.company ? ` (${c.company.name})` : ''}`,
          type: 'contact',
        });
      });
    }

    if (type === 'all' || type === 'client') {
      clients.forEach((c) => {
        opts.push({
          value: `client:${c.id}`,
          label: `Client: ${c.company?.name || 'Unknown'}`,
          type: 'client',
        });
      });
    }

    if (type === 'all' || type === 'contractor') {
      contractors.forEach((c) => {
        opts.push({
          value: `contractor:${c.id}`,
          label: `Contractor: ${c.company?.name || 'Unknown'}`,
          type: 'contractor',
        });
      });
    }

    if (type === 'all' || type === 'consultant') {
      consultants.forEach((c) => {
        opts.push({
          value: `consultant:${c.id}`,
          label: `Consultant: ${c.company?.name || c.contact?.full_name || 'Unknown'}`,
          type: 'consultant',
        });
      });
    }

    setOptions(opts);
  }, [type, companies, contacts, clients, contractors, consultants, companyId]);

  const handleChange = (selectedValue: string) => {
    const [contactType, contactId] = selectedValue.split(':');
    const option = options.find((o) => o.value === selectedValue);
    if (option) {
      const name = option.label.replace(/^(Company|Contact|Client|Contractor|Consultant):\s*/, '');
      onChange(contactId, contactType as any, name);
    }
  };

  return (
    <Select
      label={label}
      value={value || ''}
      onChange={(e) => handleChange(e.target.value)}
      options={[
        { value: '', label: `Select ${label.toLowerCase()}...` },
        ...options.map((o) => ({ value: o.value, label: o.label })),
      ]}
      required={required}
    />
  );
}
