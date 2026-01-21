import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, RotateCcw, Edit, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import { useOpportunitiesStore } from '@/stores/opportunitiesStore';
import type { Opportunity } from '@/types/opportunities';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function OpportunityArchive() {
  const navigate = useNavigate();
  const { getArchivedOpportunities, restoreOpportunity, updateOpportunity, deleteOpportunity } = useOpportunitiesStore();
  const archivedLost = getArchivedOpportunities('lost');
  const archivedWon = getArchivedOpportunities('won');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | null>(null);

  const handleRestore = (opportunity: Opportunity) => {
    if (confirm(`Restore "${opportunity.title}" to the opportunities board?`)) {
      restoreOpportunity(opportunity.id);
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  };

  const handleView = (opportunity: Opportunity) => {
    setViewingOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  const handleSave = (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    if (editingOpportunity) {
      updateOpportunity(editingOpportunity.id, opportunityData);
      setIsFormOpen(false);
      setEditingOpportunity(undefined);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this archived opportunity?')) {
      deleteOpportunity(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Opportunity Archive</h1>
            <p className="text-muted-foreground">
              View and manage archived opportunities
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {archivedLost.length} Lost
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {archivedWon.length} Won
          </Badge>
        </div>
      </div>

      {/* Archive Lost Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Archive Lost ({archivedLost.length})</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Opportunities that were marked as lost and archived
          </p>
        </div>
        {archivedLost.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No lost opportunities archived</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedLost.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{opportunity.company}</p>
                    </div>
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">More options</span>
                          ...
                        </Button>
                      }
                      items={[
                        {
                          label: 'View Details',
                          icon: Eye,
                          onClick: () => handleView(opportunity),
                        },
                        {
                          label: 'Edit',
                          icon: Edit,
                          onClick: () => handleEdit(opportunity),
                        },
                        {
                          label: 'Restore',
                          icon: RotateCcw,
                          onClick: () => handleRestore(opportunity),
                        },
                        {
                          label: 'Delete Permanently',
                          icon: Trash2,
                          onClick: () => handleDelete(opportunity.id),
                          variant: 'destructive',
                        },
                      ]}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-semibold">
                        {opportunity.currency} {opportunity.value.toLocaleString()}
                      </span>
                    </div>
                    {opportunity.archivedAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Archived:</span>
                        <span>{format(new Date(opportunity.archivedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(opportunity)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRestore(opportunity)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Archive Won Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Archive Won ({archivedWon.length})</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Won opportunities that were archived without creating a project
          </p>
        </div>
        {archivedWon.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No won opportunities archived</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedWon.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{opportunity.company}</p>
                  </div>
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">More options</span>
                        ...
                      </Button>
                    }
                    items={[
                      {
                        label: 'View Details',
                        icon: Eye,
                        onClick: () => handleView(opportunity),
                      },
                      {
                        label: 'Edit',
                        icon: Edit,
                        onClick: () => handleEdit(opportunity),
                      },
                      {
                        label: 'Restore',
                        icon: RotateCcw,
                        onClick: () => handleRestore(opportunity),
                      },
                      {
                        label: 'Delete Permanently',
                        icon: Trash2,
                        onClick: () => handleDelete(opportunity.id),
                        variant: 'destructive',
                      },
                    ]}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold">
                      {opportunity.currency} {opportunity.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stage:</span>
                    <Badge
                      className={cn(
                        'text-xs',
                        opportunity.stage === 'won' ? 'bg-green-500' : 'bg-red-500'
                      )}
                    >
                      {opportunity.stage}
                    </Badge>
                  </div>
                  {opportunity.archivedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Archived:</span>
                      <span>{format(new Date(opportunity.archivedAt), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(opportunity)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRestore(opportunity)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Modals */}
      <OpportunityForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOpportunity(undefined);
        }}
        onSave={handleSave}
        opportunity={editingOpportunity}
      />

      <OpportunityDetail
        opportunity={viewingOpportunity}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingOpportunity(null);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}
