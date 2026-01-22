import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, FileText, FolderKanban, Target, Building2, User, Clock, Loader2,
  Mail, MessageSquare, StickyNote, Map, UserCheck, HardHat, Briefcase, Receipt,
  TrendingUp, Calendar, Hash, Phone, MapPin, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { estimatesRepo } from '@/modules/estimating/data/estimates.repo';
import { useProjectsStore } from '@/stores/projectsStore';
import { useOpportunitiesStore } from '@/stores/opportunitiesStore';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useContactsStore } from '@/stores/contactsStore';
import { useClientsStore } from '@/stores/clientsStore';
import { useContractorsStore } from '@/stores/contractorsStore';
import { useConsultantsStore } from '@/stores/consultantsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useRoadmapStore } from '@/stores/roadmapStore';
import type { Estimate } from '@/modules/estimating/domain/estimating.types';
import type { Project } from '@/types/projects';
import type { Opportunity } from '@/types/opportunities';
import type { Company, Contact, Client, Contractor, Consultant } from '@/types/contacts';
import type { Note } from '@/types/notes';
import type { RoadmapItem } from '@/types/roadmap';
import { format, formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'estimate' | 'project' | 'opportunity' | 'company' | 'contact' | 'client' | 'contractor' | 'consultant' | 'note' | 'roadmap';
  title: string;
  subtitle?: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  metadata?: {
    status?: string;
    value?: number;
    date?: Date;
    location?: string;
    tags?: string[];
    [key: string]: any;
  };
  relevanceScore?: number;
}

interface SearchGroup {
  type: SearchResult['type'];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  results: SearchResult[];
}

// Helper function to calculate relevance score
const calculateRelevance = (text: string, query: string): number => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 70;
  
  // Word boundary matches get higher score
  const words = queryLower.split(/\s+/);
  const wordMatches = words.filter(word => textLower.includes(word)).length;
  if (wordMatches > 0) return 50 + (wordMatches / words.length) * 20;
  
  // Partial word matches get lower score
  const partialMatches = words.filter(word => 
    textLower.split(/\s+/).some(textWord => textWord.includes(word) || word.includes(textWord))
  ).length;
  if (partialMatches > 0) return 30 + (partialMatches / words.length) * 20;
  
  return 0;
};

// Helper function to highlight search terms
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { projects, fetchProjects } = useProjectsStore();
  const { opportunities } = useOpportunitiesStore();
  const { companies, fetchCompanies } = useCompaniesStore();
  const { contacts, fetchContacts } = useContactsStore();
  const { clients, fetchClients } = useClientsStore();
  const { contractors, fetchContractors } = useContractorsStore();
  const { consultants, fetchConsultants } = useConsultantsStore();
  const { notes } = useNotesStore();
  const { items: roadmapItems } = useRoadmapStore();

  // Load data on mount
  useEffect(() => {
    fetchProjects();
    fetchCompanies();
    fetchContacts();
    fetchClients();
    fetchContractors();
    fetchConsultants();
  }, [fetchProjects, fetchCompanies, fetchContacts, fetchClients, fetchContractors, fetchConsultants]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        searchInputRef.current?.focus();
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Comprehensive search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const queryLower = searchQuery.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    const searchResults: SearchResult[] = [];

    try {
      // Search Estimates
      const estimates = await estimatesRepo.list();
      estimates
        .filter((e: Estimate) => {
          const searchableText = [
            e.title,
            e.reference,
            e.status,
            e.description,
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((estimate: Estimate) => {
          const relevance = calculateRelevance(
            `${estimate.title} ${estimate.reference || ''}`,
            searchQuery
          );
          return {
            id: estimate.id,
            type: 'estimate' as const,
            title: estimate.title || 'Untitled Estimate',
            subtitle: estimate.reference ? `Ref: ${estimate.reference}` : undefined,
            description: `Status: ${estimate.status}`,
            icon: FileText,
            url: `/estimating/${estimate.id}`,
            metadata: {
              status: estimate.status,
              value: estimate.total,
              date: estimate.updated_at ? new Date(estimate.updated_at) : undefined,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 8)
        .forEach(result => searchResults.push(result));

      // Search Projects
      projects
        .filter((p: Project) => {
          const searchableText = [
            p.name,
            p.reference,
            p.description,
            p.status,
            p.type,
            p.site_town_city,
            p.site_postcode,
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((project: Project) => {
          const relevance = calculateRelevance(
            `${project.name} ${project.reference || ''}`,
            searchQuery
          );
          return {
            id: project.id,
            type: 'project' as const,
            title: project.name || 'Untitled Project',
            subtitle: project.reference ? `Ref: ${project.reference}` : undefined,
            description: project.site_town_city || project.description,
            icon: FolderKanban,
            url: `/projects/${project.id}`,
            metadata: {
              status: project.status,
              value: project.project_value,
              location: project.site_town_city,
              date: project.updated_at ? new Date(project.updated_at) : undefined,
              tags: project.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 8)
        .forEach(result => searchResults.push(result));

      // Search Opportunities
      opportunities
        .filter((o: Opportunity) => {
          const searchableText = [
            o.title,
            o.company,
            o.contact,
            o.description,
            o.stage,
            o.source,
            ...(o.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((opportunity: Opportunity) => {
          const relevance = calculateRelevance(
            `${opportunity.title} ${opportunity.company || ''}`,
            searchQuery
          );
          return {
            id: opportunity.id,
            type: 'opportunity' as const,
            title: opportunity.title || 'Untitled Opportunity',
            subtitle: opportunity.company,
            description: `Stage: ${opportunity.stage}`,
            icon: Target,
            url: `/opportunities`,
            metadata: {
              status: opportunity.stage,
              value: opportunity.value,
              date: opportunity.expectedCloseDate,
              tags: opportunity.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 8)
        .forEach(result => searchResults.push(result));

      // Search Companies
      companies
        .filter((c: Company) => {
          const searchableText = [
            c.name,
            c.legal_name,
            c.email,
            c.phone,
            c.website,
            c.town_city,
            c.postcode,
            c.industry,
            ...(c.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((company: Company) => {
          const relevance = calculateRelevance(
            `${company.name} ${company.legal_name || ''} ${company.email || ''}`,
            searchQuery
          );
          return {
            id: company.id,
            type: 'company' as const,
            title: company.name || 'Untitled Company',
            subtitle: company.email || company.phone,
            description: company.town_city || company.industry,
            icon: Building2,
            url: `/companies`,
            metadata: {
              location: company.town_city,
              tags: company.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 6)
        .forEach(result => searchResults.push(result));

      // Search Contacts
      contacts
        .filter((c: Contact) => {
          const searchableText = [
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.job_title,
            c.company_name,
            ...(c.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((contact: Contact) => {
          const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
          const relevance = calculateRelevance(
            `${fullName} ${contact.email || ''} ${contact.phone || ''}`,
            searchQuery
          );
          return {
            id: contact.id,
            type: 'contact' as const,
            title: fullName || 'Untitled Contact',
            subtitle: contact.email || contact.phone,
            description: contact.job_title || contact.company_name,
            icon: User,
            url: `/contacts`,
            metadata: {
              tags: contact.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 6)
        .forEach(result => searchResults.push(result));

      // Search Clients
      clients
        .filter((c: Client) => {
          const searchableText = [
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.company_name,
            ...(c.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((client: Client) => {
          const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
          const relevance = calculateRelevance(
            `${fullName} ${client.email || ''} ${client.company_name || ''}`,
            searchQuery
          );
          return {
            id: client.id,
            type: 'client' as const,
            title: fullName || client.company_name || 'Untitled Client',
            subtitle: client.email || client.phone,
            description: client.company_name,
            icon: UserCheck,
            url: `/contacts/clients`,
            metadata: {
              tags: client.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 6)
        .forEach(result => searchResults.push(result));

      // Search Contractors
      contractors
        .filter((c: Contractor) => {
          const searchableText = [
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.company_name,
            c.trade,
            ...(c.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((contractor: Contractor) => {
          const fullName = `${contractor.first_name || ''} ${contractor.last_name || ''}`.trim();
          const relevance = calculateRelevance(
            `${fullName} ${contractor.company_name || ''} ${contractor.trade || ''}`,
            searchQuery
          );
          return {
            id: contractor.id,
            type: 'contractor' as const,
            title: fullName || contractor.company_name || 'Untitled Contractor',
            subtitle: contractor.email || contractor.phone,
            description: contractor.trade || contractor.company_name,
            icon: HardHat,
            url: `/contacts/contractors`,
            metadata: {
              tags: contractor.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 6)
        .forEach(result => searchResults.push(result));

      // Search Consultants
      consultants
        .filter((c: Consultant) => {
          const searchableText = [
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.company_name,
            c.consultant_type,
            ...(c.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((consultant: Consultant) => {
          const fullName = `${consultant.first_name || ''} ${consultant.last_name || ''}`.trim();
          const relevance = calculateRelevance(
            `${fullName} ${consultant.company_name || ''} ${consultant.consultant_type || ''}`,
            searchQuery
          );
          return {
            id: consultant.id,
            type: 'consultant' as const,
            title: fullName || consultant.company_name || 'Untitled Consultant',
            subtitle: consultant.email || consultant.phone,
            description: consultant.consultant_type || consultant.company_name,
            icon: Briefcase,
            url: `/contacts/consultants`,
            metadata: {
              tags: consultant.tags,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 6)
        .forEach(result => searchResults.push(result));

      // Search Notes
      notes
        .filter((n: Note) => {
          const searchableText = [
            n.title,
            n.content,
            n.assignedTo?.name,
            ...(n.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((note: Note) => {
          const relevance = calculateRelevance(
            `${note.title || ''} ${note.content || ''}`,
            searchQuery
          );
          return {
            id: note.id,
            type: 'note' as const,
            title: note.title || 'Untitled Note',
            subtitle: note.assignedTo?.name,
            description: note.content?.substring(0, 100),
            icon: StickyNote,
            url: '/notes',
            metadata: {
              date: note.updatedAt,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 5)
        .forEach(result => searchResults.push(result));

      // Search Roadmap Items
      roadmapItems
        .filter((r: RoadmapItem) => {
          const searchableText = [
            r.title,
            r.description,
            r.category,
            ...(r.tags || []),
          ].filter(Boolean).join(' ').toLowerCase();
          return queryWords.some(word => searchableText.includes(word));
        })
        .map((item: RoadmapItem) => {
          const relevance = calculateRelevance(
            `${item.title} ${item.description || ''}`,
            searchQuery
          );
          return {
            id: item.id,
            type: 'roadmap' as const,
            title: item.title || 'Untitled Roadmap Item',
            subtitle: item.category,
            description: item.description?.substring(0, 100),
            icon: Map,
            url: '/roadmap',
            metadata: {
              status: item.stage,
              priority: item.priority,
              tags: item.tags,
              date: item.targetDate,
            },
            relevanceScore: relevance,
          };
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 5)
        .forEach(result => searchResults.push(result));

      // Sort all results by relevance
      searchResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchGroup> = {};
    const typeConfig: Record<SearchResult['type'], { label: string; icon: React.ComponentType<{ className?: string }> }> = {
      estimate: { label: 'Estimates', icon: FileText },
      project: { label: 'Projects', icon: FolderKanban },
      opportunity: { label: 'Opportunities', icon: Target },
      company: { label: 'Companies', icon: Building2 },
      contact: { label: 'Contacts', icon: User },
      client: { label: 'Clients', icon: UserCheck },
      contractor: { label: 'Contractors', icon: HardHat },
      consultant: { label: 'Consultants', icon: Briefcase },
      note: { label: 'Notes', icon: StickyNote },
      roadmap: { label: 'Roadmap', icon: Map },
    };

    results.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = {
          type: result.type,
          label: typeConfig[result.type].label,
          icon: typeConfig[result.type].icon,
          results: [],
        };
      }
      groups[result.type].results.push(result);
    });

    return Object.values(groups);
  }, [results]);

  // Flattened results for keyboard navigation
  const flattenedResults = useMemo(() => {
    return groupedResults.flatMap(group => group.results);
  }, [groupedResults]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flattenedResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && flattenedResults[selectedIndex]) {
        e.preventDefault();
        handleResultClick(flattenedResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flattenedResults, selectedIndex]);

  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.querySelector(`[data-result-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return null;
    }
  };

  let resultIndex = 0;

  return (
    <div 
      className="relative flex-shrink-0" 
      style={{ 
        width: '100%', 
        maxWidth: '28rem',
        minWidth: '20rem',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={(e) => {
              // Delay closing to allow clicks on results
              setTimeout(() => {
                if (!e.currentTarget.contains(document.activeElement)) {
                  setIsOpen(false);
                }
              }, 200);
            }}
            placeholder="Search everything..."
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                searchInputRef.current?.focus();
              }}
              className="rounded p-1 hover:bg-accent flex-shrink-0"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!query && (
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex flex-shrink-0">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>

        {/* Results Dropdown */}
        {isOpen && (query || results.length > 0) && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-background shadow-lg"
            style={{ 
              maxHeight: '600px', 
              overflowY: 'auto',
              zIndex: 1001,
              position: 'absolute',
              minWidth: '32rem'
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
          >
            {query && results.length > 0 ? (
              <div ref={resultsRef} className="divide-y">
                {groupedResults.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.type} className="py-2">
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <GroupIcon className="h-3.5 w-3.5" />
                        <span>{group.label}</span>
                        <span className="ml-auto text-xs font-normal">
                          {group.results.length} {group.results.length === 1 ? 'result' : 'results'}
                        </span>
                      </div>
                      
                      {/* Group Results */}
                      <div className="space-y-1">
                        {group.results.map((result) => {
                          const currentIndex = resultIndex++;
                          const Icon = result.icon;
                          const isSelected = selectedIndex === currentIndex;
                          
                          return (
                            <button
                              key={`${result.type}-${result.id}`}
                              data-result-index={currentIndex}
                              onClick={() => handleResultClick(result)}
                              className={cn(
                                'flex w-full items-start gap-3 rounded-md px-4 py-2.5 text-left transition-colors',
                                'hover:bg-accent',
                                isSelected && 'bg-accent'
                              )}
                              onMouseEnter={() => setSelectedIndex(currentIndex)}
                            >
                              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                  {highlightText(result.title, query)}
                                </div>
                                {result.subtitle && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {highlightText(result.subtitle, query)}
                                  </div>
                                )}
                                {result.description && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {highlightText(result.description, query)}
                                  </div>
                                )}
                                
                                {/* Metadata */}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  {result.metadata?.status && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Tag className="h-3 w-3" />
                                      <span className="capitalize">{result.metadata.status}</span>
                                    </div>
                                  )}
                                  {result.metadata?.value && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Receipt className="h-3 w-3" />
                                      <span>{formatCurrency(result.metadata.value)}</span>
                                    </div>
                                  )}
                                  {result.metadata?.location && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span>{result.metadata.location}</span>
                                    </div>
                                  )}
                                  {result.metadata?.date && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatDate(result.metadata.date)}</span>
                                    </div>
                                  )}
                                  {result.metadata?.tags && result.metadata.tags.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Hash className="h-3 w-3" />
                                      <span>{result.metadata.tags.slice(0, 3).join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {/* Total Results Count */}
                <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground text-center">
                  {results.length} {results.length === 1 ? 'result' : 'results'} found
                </div>
              </div>
            ) : query && !isSearching ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-xs mt-2">Try different keywords or check your spelling</p>
              </div>
            ) : null}
            
            {/* Empty State - Show when no query */}
            {!query && (
              <div className="p-6">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Search ConstructOS</p>
                  <p className="text-xs mt-1">Search across estimates, projects, opportunities, contacts, and more</p>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('/estimating/dashboard')}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>View Estimates</span>
                    </button>
                    <button
                      onClick={() => navigate('/projects')}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span>View Projects</span>
                    </button>
                    <button
                      onClick={() => navigate('/opportunities')}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>View Opportunities</span>
                    </button>
                    <button
                      onClick={() => navigate('/contacts')}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>View Contacts</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
