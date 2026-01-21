import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Grid3x3, List, Table, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import CompanyCard from '@/components/contacts/CompanyCard';
import CompanyForm from '@/components/contacts/CompanyForm';
import CompanyDetail from '@/components/contacts/CompanyDetail';
import ViewSwitcher from '@/components/contacts/ViewSwitcher';
import Modal from '@/components/ui/Modal';
import { useCompaniesStore } from '@/stores/companiesStore';
import { supabase } from '@/lib/supabase';
import type { Company, ContactViewType } from '@/types/contacts';
import { cn } from '@/lib/utils';

export default function Companies() {
  const {
    companies,
    viewType,
    filters,
    sortOptions,
    isLoading,
    error,
    setViewType,
    setFilters,
    setSortOptions,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    setSelectedCompany,
  } = useCompaniesStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...companies];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.email?.toLowerCase().includes(query) ||
          company.phone?.toLowerCase().includes(query) ||
          company.industry?.toLowerCase().includes(query) ||
          company.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      result = result.filter((company) => filters.type!.includes(company.type));
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter((company) => filters.status!.includes(company.status));
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortOptions.field] || '';
      const bValue = b[sortOptions.field] || '';
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [companies, searchQuery, filters, sortOptions]);

  const handleNewCompany = () => {
    setEditingCompany(undefined);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setViewingCompany(company);
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompany(id);
    }
  };

  const handleSaveCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
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
      ...companyData,
      company_id: membership?.company_id || '00000000-0000-0000-0000-000000000000',
    };

    if (editingCompany) {
      await updateCompany(editingCompany.id, finalData);
    } else {
      await createCompany(finalData);
    }
    setIsFormOpen(false);
    setEditingCompany(undefined);
    await fetchCompanies();
  };

  // Render Grid View
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedCompanies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={handleEditCompany}
          onDelete={handleDeleteCompany}
          onView={handleViewCompany}
        />
      ))}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedCompanies.map((company) => (
        <Card
          key={company.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleViewCompany(company)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{company.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {company.email && <span>{company.email}</span>}
                  {company.phone && <span>{company.phone}</span>}
                  {company.industry && <span>{company.industry}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">{company.type}</span>
                <span className="text-sm text-muted-foreground">{company.status}</span>
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
            <th className="text-left p-3 font-semibold">Type</th>
            <th className="text-left p-3 font-semibold">Email</th>
            <th className="text-left p-3 font-semibold">Phone</th>
            <th className="text-left p-3 font-semibold">Industry</th>
            <th className="text-left p-3 font-semibold">Status</th>
            <th className="text-left p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedCompanies.map((company) => (
            <tr
              key={company.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => handleViewCompany(company)}
            >
              <td className="p-3 font-medium">{company.name}</td>
              <td className="p-3">{company.type}</td>
              <td className="p-3">{company.email || '-'}</td>
              <td className="p-3">{company.phone || '-'}</td>
              <td className="p-3">{company.industry || '-'}</td>
              <td className="p-3">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs',
                    company.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  )}
                >
                  {company.status}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCompany(company)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCompany(company.id)}
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

  // Render Detail View (shows first company or selected)
  const renderDetailView = () => {
    const companyToShow = viewingCompany || filteredAndSortedCompanies[0];
    if (!companyToShow) {
      return <div className="text-center text-muted-foreground py-12">No companies to display</div>;
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{companyToShow.name}</h2>
              {companyToShow.legal_name && (
                <p className="text-muted-foreground">{companyToShow.legal_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-1 text-sm">
                  {companyToShow.email && <p>Email: {companyToShow.email}</p>}
                  {companyToShow.phone && <p>Phone: {companyToShow.phone}</p>}
                  {companyToShow.website && <p>Website: {companyToShow.website}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <div className="text-sm">
                  {companyToShow.address_line1 && <p>{companyToShow.address_line1}</p>}
                  {companyToShow.address_line2 && <p>{companyToShow.address_line2}</p>}
                  {companyToShow.town_city && <p>{companyToShow.town_city}</p>}
                  {companyToShow.county && <p>{companyToShow.county}</p>}
                  {companyToShow.postcode && <p>{companyToShow.postcode}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Business Details</h3>
                <div className="space-y-1 text-sm">
                  <p>Type: {companyToShow.type}</p>
                  {companyToShow.industry && <p>Industry: {companyToShow.industry}</p>}
                  {companyToShow.employee_count && <p>Employees: {companyToShow.employee_count}</p>}
                  {companyToShow.vat_number && <p>VAT: {companyToShow.vat_number}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <div className="space-y-1 text-sm">
                  <p>Status: {companyToShow.status}</p>
                  {companyToShow.payment_terms && <p>Payment Terms: {companyToShow.payment_terms}</p>}
                </div>
              </div>
            </div>

            {companyToShow.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{companyToShow.notes}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage client companies, subcontractor firms, and consultant agencies.
          </p>
        </div>
        <Button onClick={handleNewCompany}>
          <Plus className="mr-2 h-4 w-4" />
          New Company
        </Button>
      </div>

      {/* Filters and View Switcher */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
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
        <div className="text-center py-12 text-muted-foreground">Loading companies...</div>
      ) : filteredAndSortedCompanies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No companies found matching your search.' : 'No companies yet. Create your first company to get started.'}
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

      {/* Company Form Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCompany(undefined);
          }}
          title={editingCompany ? 'Edit Company' : 'New Company'}
          size="xl"
        >
          <CompanyForm
            company={editingCompany}
            onSave={handleSaveCompany}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCompany(undefined);
            }}
          />
        </Modal>
      )}

      {/* Company Detail Modal */}
      <CompanyDetail
        company={viewingCompany}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingCompany(null);
        }}
        onEdit={handleEditCompany}
      />
    </div>
  );
}
