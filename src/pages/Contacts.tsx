import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import ContactCard from '@/components/contacts/ContactCard';
import ContactForm from '@/components/contacts/ContactForm';
import ContactDetail from '@/components/contacts/ContactDetail';
import ViewSwitcher from '@/components/contacts/ViewSwitcher';
import Modal from '@/components/ui/Modal';
import { useContactsStore } from '@/stores/contactsStore';
import { supabase } from '@/lib/supabase';
import type { Contact, ContactViewType } from '@/types/contacts';
import { cn } from '@/lib/utils';

export default function Contacts() {
  const {
    contacts,
    viewType,
    filters,
    sortOptions,
    isLoading,
    error,
    setViewType,
    setFilters,
    setSortOptions,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    setSelectedContact,
  } = useContactsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (contact) =>
          `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.phone?.toLowerCase().includes(query) ||
          contact.job_title?.toLowerCase().includes(query) ||
          contact.company?.name.toLowerCase().includes(query) ||
          contact.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      result = result.filter((contact) => filters.type!.includes(contact.type));
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter((contact) => filters.status!.includes(contact.status));
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortOptions.field] || '';
      const bValue = b[sortOptions.field] || '';
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [contacts, searchQuery, filters, sortOptions]);

  const handleNewContact = () => {
    setEditingContact(undefined);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'full_name' | 'company'>) => {
    // Get current user's company_id from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get company_id from company_memberships
    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    const finalData = {
      ...contactData,
      company_id: membership?.company_id || '00000000-0000-0000-0000-000000000000',
    };

    if (editingContact) {
      await updateContact(editingContact.id, finalData);
    } else {
      await createContact(finalData);
    }
    setIsFormOpen(false);
    setEditingContact(undefined);
    await fetchContacts();
  };

  // Render Grid View
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedContacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
          onView={handleViewContact}
        />
      ))}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedContacts.map((contact) => (
        <Card
          key={contact.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleViewContact(contact)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {contact.email && <span>{contact.email}</span>}
                  {contact.phone && <span>{contact.phone}</span>}
                  {contact.job_title && <span>{contact.job_title}</span>}
                  {contact.company && <span>{contact.company.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">{contact.type}</span>
                <span className="text-sm text-muted-foreground">{contact.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render Table View
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Company</th>
            <th className="text-left p-3 font-semibold">Job Title</th>
            <th className="text-left p-3 font-semibold">Email</th>
            <th className="text-left p-3 font-semibold">Phone</th>
            <th className="text-left p-3 font-semibold">Type</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedContacts.map((contact) => (
            <tr
              key={contact.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => handleViewContact(contact)}
            >
              <td className="p-3 font-medium">
                {contact.full_name || `${contact.first_name} ${contact.last_name}`}
              </td>
              <td className="p-3">{contact.company?.name || '-'}</td>
              <td className="p-3">{contact.job_title || '-'}</td>
              <td className="p-3">{contact.email || '-'}</td>
              <td className="p-3">{contact.phone || '-'}</td>
              <td className="p-3">{contact.type}</td>
              <td className="p-3">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs',
                    contact.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  )}
                >
                  {contact.status}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditContact(contact)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render Detail View
  const renderDetailView = () => {
    const contactToShow = viewingContact || filteredAndSortedContacts[0];
    if (!contactToShow) {
      return <div className="text-center text-muted-foreground py-12">No contacts to display</div>;
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                {contactToShow.full_name || `${contactToShow.first_name} ${contactToShow.last_name}`}
              </h2>
              {contactToShow.job_title && (
                <p className="text-muted-foreground">{contactToShow.job_title}</p>
              )}
              {contactToShow.company && (
                <p className="text-muted-foreground">{contactToShow.company.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-1 text-sm">
                  {contactToShow.email && <p>Email: {contactToShow.email}</p>}
                  {contactToShow.phone && <p>Phone: {contactToShow.phone}</p>}
                  {contactToShow.mobile && <p>Mobile: {contactToShow.mobile}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <div className="text-sm">
                  {contactToShow.address_line1 && <p>{contactToShow.address_line1}</p>}
                  {contactToShow.address_line2 && <p>{contactToShow.address_line2}</p>}
                  {contactToShow.town_city && <p>{contactToShow.town_city}</p>}
                  {contactToShow.county && <p>{contactToShow.county}</p>}
                  {contactToShow.postcode && <p>{contactToShow.postcode}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="space-y-1 text-sm">
                  <p>Type: {contactToShow.type}</p>
                  <p>Status: {contactToShow.status}</p>
                  {contactToShow.department && <p>Department: {contactToShow.department}</p>}
                  {contactToShow.is_primary_contact && <p className="text-primary-600">Primary Contact</p>}
                  {contactToShow.is_decision_maker && <p className="text-primary-600">Decision Maker</p>}
                </div>
              </div>
            </div>

            {contactToShow.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{contactToShow.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage individual contacts linked to companies.
          </p>
        </div>
        <Button onClick={handleNewContact}>
          <Plus className="mr-2 h-4 w-4" />
          New Contact
        </Button>
      </div>

      {/* Filters and View Switcher */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ViewSwitcher viewType={viewType} onViewChange={setViewType} />
      </div>

      {/* Content */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading contacts...</div>
      ) : filteredAndSortedContacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No contacts found matching your search.' : 'No contacts yet. Create your first contact to get started.'}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewType === 'grid' && renderGridView()}
          {viewType === 'list' && renderListView()}
          {viewType === 'table' && renderTableView()}
          {viewType === 'detail' && renderDetailView()}
        </>
      )}

      {/* Contact Form Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingContact(undefined);
          }}
          title={editingContact ? 'Edit Contact' : 'New Contact'}
          size="xl"
        >
          <ContactForm
            contact={editingContact}
            onSave={handleSaveContact}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingContact(undefined);
            }}
          />
        </Modal>
      )}

      {/* Contact Detail Modal */}
      <ContactDetail
        contact={viewingContact}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingContact(null);
        }}
        onEdit={handleEditContact}
      />
    </div>
  );
}
