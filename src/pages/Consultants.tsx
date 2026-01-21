import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import ConsultantForm from '@/components/contacts/ConsultantForm';
import ConsultantDetail from '@/components/contacts/ConsultantDetail';
import ViewSwitcher from '@/components/contacts/ViewSwitcher';
import Modal from '@/components/ui/Modal';
import { useConsultantsStore } from '@/stores/consultantsStore';
import { supabase } from '@/lib/supabase';
import type { Consultant, ContactViewType } from '@/types/contacts';
import Badge from '@/components/ui/Badge';

export default function Consultants() {
  const {
    consultants,
    viewType,
    isLoading,
    error,
    setViewType,
    fetchConsultants,
    createConsultant,
    updateConsultant,
    deleteConsultant,
    setSelectedConsultant,
  } = useConsultantsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingConsultant, setViewingConsultant] = useState<Consultant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants]);

  const filteredAndSortedConsultants = useMemo(() => {
    let result = [...consultants];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (consultant) =>
          consultant.company?.name.toLowerCase().includes(query) ||
          consultant.consultant_type?.toLowerCase().includes(query) ||
          consultant.specializations?.some((s) => s.toLowerCase().includes(query))
      );
    }
    return result;
  }, [consultants, searchQuery]);

  const [editingConsultant, setEditingConsultant] = useState<Consultant | undefined>();

  const handleNewConsultant = () => {
    setEditingConsultant(undefined);
    setIsFormOpen(true);
  };

  const handleEditConsultant = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setIsFormOpen(true);
  };

  const handleSaveConsultant = async (consultantData: Omit<Consultant, 'id' | 'created_at' | 'updated_at' | 'company' | 'contact'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from('company_memberships')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    const finalData = {
      ...consultantData,
      company_id: membership?.company_id || '00000000-0000-0000-0000-000000000000',
    };

    if (editingConsultant) {
      await updateConsultant(editingConsultant.id, finalData);
    } else {
      await createConsultant(finalData);
    }
    setIsFormOpen(false);
    setEditingConsultant(undefined);
    await fetchConsultants();
  };

  const handleViewConsultant = (consultant: Consultant) => {
    setViewingConsultant(consultant);
    setSelectedConsultant(consultant);
    setIsDetailOpen(true);
  };

  const handleDeleteConsultant = async (id: string) => {
    if (confirm('Are you sure you want to delete this consultant?')) {
      await deleteConsultant(id);
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedConsultants.map((consultant) => (
        <Card key={consultant.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewConsultant(consultant)}>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              {consultant.company?.name || consultant.contact?.full_name || 'Unknown'}
            </h3>
            {consultant.consultant_type && (
              <Badge variant="outline" className="mb-2">{consultant.consultant_type}</Badge>
            )}
            {consultant.specializations && consultant.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {consultant.specializations.slice(0, 2).map((spec, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
                ))}
              </div>
            )}
            {consultant.hourly_rate && (
              <p className="text-sm text-muted-foreground">£{consultant.hourly_rate}/hr</p>
            )}
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
            <th className="text-left p-3 font-semibold">Name</th>
            <th className="text-left p-3 font-semibold">Type</th>
            <th className="text-left p-3 font-semibold">Specializations</th>
            <th className="text-left p-3 font-semibold">Rate</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedConsultants.map((consultant) => (
            <tr key={consultant.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handleViewConsultant(consultant)}>
              <td className="p-3 font-medium">
                {consultant.company?.name || consultant.contact?.full_name || '-'}
              </td>
              <td className="p-3">{consultant.consultant_type || '-'}</td>
              <td className="p-3">{consultant.specializations?.join(', ') || '-'}</td>
              <td className="p-3">
                {consultant.hourly_rate ? `£${consultant.hourly_rate}/hr` : '-'}
              </td>
              <td className="p-3">{consultant.relationship_status}</td>
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteConsultant(consultant.id)}>
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
          <h1 className="text-3xl font-bold">Consultants</h1>
          <p className="text-muted-foreground">Manage your consultant contacts</p>
        </div>
        <Button onClick={handleNewConsultant}>
          <Plus className="mr-2 h-4 w-4" />
          New Consultant
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consultants..."
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
        <div className="text-center py-12 text-muted-foreground">Loading consultants...</div>
      ) : filteredAndSortedConsultants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No consultants found.' : 'No consultants yet.'}
          </CardContent>
        </Card>
      ) : (
        <>
          {viewType === 'grid' && renderGridView()}
          {viewType === 'table' && renderTableView()}
        </>
      )}

      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingConsultant ? 'Edit Consultant' : 'New Consultant'} size="xl">
          <ConsultantForm
            consultant={editingConsultant}
            onSave={handleSaveConsultant}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingConsultant(undefined);
            }}
          />
        </Modal>
      )}

      <ConsultantDetail
        consultant={viewingConsultant}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingConsultant(null);
        }}
        onEdit={handleEditConsultant}
      />
    </div>
  );
}
