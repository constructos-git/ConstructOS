import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import CompanyCard from '@/components/contacts/CompanyCard';
import ContractorForm from '@/components/contacts/ContractorForm';
import ContractorDetail from '@/components/contacts/ContractorDetail';
import ViewSwitcher from '@/components/contacts/ViewSwitcher';
import Modal from '@/components/ui/Modal';
import { useContractorsStore } from '@/stores/contractorsStore';
import { supabase } from '@/lib/supabase';
import type { Contractor, ContactViewType } from '@/types/contacts';
import Badge from '@/components/ui/Badge';

export default function Contractors() {
  const {
    contractors,
    viewType,
    filters,
    sortOptions,
    isLoading,
    error,
    setViewType,
    fetchContractors,
    createContractor,
    updateContractor,
    deleteContractor,
    setSelectedContractor,
  } = useContractorsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | undefined>();
  const [viewingContractor, setViewingContractor] = useState<Contractor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const filteredAndSortedContractors = useMemo(() => {
    let result = [...contractors];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (contractor) =>
          contractor.company?.name.toLowerCase().includes(query) ||
          contractor.trade_types?.some((t) => t.toLowerCase().includes(query))
      );
    }
    return result;
  }, [contractors, searchQuery]);

  const handleNewContractor = () => {
    setEditingContractor(undefined);
    setIsFormOpen(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsFormOpen(true);
  };

  const handleSaveContractor = async (contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'company' | 'preferred_contact' | 'contacts'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    const finalData = {
      ...contractorData,
      company_id: membership?.company_id || '00000000-0000-0000-0000-000000000000',
    };

    if (editingContractor) {
      await updateContractor(editingContractor.id, finalData);
    } else {
      await createContractor(finalData);
    }
    setIsFormOpen(false);
    setEditingContractor(undefined);
    await fetchContractors();
  };

  const handleViewContractor = (contractor: Contractor) => {
    setViewingContractor(contractor);
    setSelectedContractor(contractor);
    setIsDetailOpen(true);
  };

  const handleDeleteContractor = async (id: string) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      await deleteContractor(id);
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedContractors.map((contractor) => (
        contractor.company && (
          <Card key={contractor.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewContractor(contractor)}>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{contractor.company.name}</h3>
              {contractor.trade_types && contractor.trade_types.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {contractor.trade_types.slice(0, 3).map((trade, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{trade}</Badge>
                  ))}
                </div>
              )}
              {contractor.rating && (
                <p className="text-sm text-muted-foreground">Rating: {contractor.rating.toFixed(1)}/5.0</p>
              )}
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Company</th>
            <th className="text-left p-3 font-semibold">Trades</th>
            <th className="text-left p-3 font-semibold">Rating</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedContractors.map((contractor) => (
            <tr key={contractor.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handleViewContractor(contractor)}>
              <td className="p-3 font-medium">{contractor.company?.name || '-'}</td>
              <td className="p-3">{contractor.trade_types?.join(', ') || '-'}</td>
              <td className="p-3">{contractor.rating ? contractor.rating.toFixed(1) : '-'}</td>
              <td className="p-3">{contractor.relationship_status}</td>
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteContractor(contractor.id)}>
                  Delete
                </Button>
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
          <h1 className="text-3xl font-bold">Contractors</h1>
          <p className="text-muted-foreground">Manage your contractor contacts</p>
        </div>
        <Button onClick={handleNewContractor}>
          <Plus className="mr-2 h-4 w-4" />
          New Contractor
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ViewSwitcher viewType={viewType} onViewChange={setViewType} />
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading contractors...</div>
      ) : filteredAndSortedContractors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No contractors found.' : 'No contractors yet.'}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewType === 'grid' && renderGridView()}
          {viewType === 'table' && renderTableView()}
        </>
      )}

      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingContractor ? 'Edit Contractor' : 'New Contractor'} size="xl">
          <ContractorForm
            contractor={editingContractor}
            onSave={handleSaveContractor}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingContractor(undefined);
            }}
          />
        </Modal>
      )}

      <ContractorDetail
        contractor={viewingContractor}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingContractor(null);
        }}
        onEdit={handleEditContractor}
      />
    </div>
  );
}
