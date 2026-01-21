import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import CompanyCard from '@/components/contacts/CompanyCard';
import ClientForm from '@/components/contacts/ClientForm';
import ClientDetail from '@/components/contacts/ClientDetail';
import ViewSwitcher from '@/components/contacts/ViewSwitcher';
import Modal from '@/components/ui/Modal';
import { useClientsStore } from '@/stores/clientsStore';
import { supabase } from '@/lib/supabase';
import type { Client, ContactViewType } from '@/types/contacts';
import { cn } from '@/lib/utils';

export default function Clients() {
  const {
    clients,
    viewType,
    filters,
    sortOptions,
    isLoading,
    error,
    setViewType,
    setFilters,
    setSortOptions,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    setSelectedClient,
  } = useClientsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.company?.name.toLowerCase().includes(query) ||
          client.company?.email?.toLowerCase().includes(query) ||
          client.notes?.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortOptions.field] || '';
      const bValue = b[sortOptions.field] || '';
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, sortOptions]);

  const handleNewClient = () => {
    setEditingClient(undefined);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
    }
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company' | 'contacts'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    const finalData = {
      ...clientData,
      company_id: membership?.company_id || '00000000-0000-0000-0000-000000000000',
    };

    if (editingClient) {
      await updateClient(editingClient.id, finalData);
    } else {
      await createClient(finalData);
    }
    setIsFormOpen(false);
    setEditingClient(undefined);
    await fetchClients();
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedClients.map((client) => (
        client.company && (
          <CompanyCard
            key={client.id}
            company={client.company}
            onEdit={() => handleEditClient(client)}
            onDelete={() => handleDeleteClient(client.id)}
            onView={() => handleViewClient(client)}
          />
        )
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedClients.map((client) => (
        <Card
          key={client.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleViewClient(client)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{client.company?.name || 'Unknown Company'}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {client.client_type && <span>{client.client_type}</span>}
                  {client.average_project_value && (
                    <span>Avg Project: £{client.average_project_value.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">{client.relationship_status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Company</th>
            <th className="text-left p-3 font-semibold">Type</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-left p-3 font-semibold">Avg Project Value</th>
            <th className="text-left p-3 font-semibold">Outstanding Balance</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedClients.map((client) => (
            <tr
              key={client.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => handleViewClient(client)}
            >
              <td className="p-3 font-medium">{client.company?.name || '-'}</td>
              <td className="p-3">{client.client_type || '-'}</td>
              <td className="p-3">{client.relationship_status}</td>
              <td className="p-3">
                {client.average_project_value ? `£${client.average_project_value.toLocaleString()}` : '-'}
              </td>
              <td className="p-3">£{client.outstanding_balance.toLocaleString()}</td>
              <td className="p-3">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)}>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your client contacts</p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ViewSwitcher viewType={viewType} onViewChange={setViewType} />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading clients...</div>
      ) : filteredAndSortedClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No clients found.' : 'No clients yet.'}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewType === 'grid' && renderGridView()}
          {viewType === 'list' && renderListView()}
          {viewType === 'table' && renderTableView()}
        </>
      )}

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingClient(undefined);
          }}
          title={editingClient ? 'Edit Client' : 'New Client'}
          size="xl"
        >
          <ClientForm
            client={editingClient}
            onSave={handleSaveClient}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingClient(undefined);
            }}
          />
        </Modal>
      )}

      <ClientDetail
        client={viewingClient}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingClient(null);
        }}
        onEdit={handleEditClient}
      />
    </div>
  );
}
