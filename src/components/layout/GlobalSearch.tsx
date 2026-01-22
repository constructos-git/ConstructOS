import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, FolderKanban, Target, Building2, User, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { estimatesRepo } from '@/modules/estimating/data/estimates.repo';
import { useProjectsStore } from '@/stores/projectsStore';
import { useOpportunitiesStore } from '@/stores/opportunitiesStore';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useContactsStore } from '@/stores/contactsStore';
import type { Estimate } from '@/modules/estimating/domain/estimating.types';
import type { Project } from '@/types/projects';
import type { Opportunity } from '@/types/opportunities';
import type { Company } from '@/types/contacts';
import type { Contact } from '@/types/contacts';

interface SearchResult {
  id: string;
  type: 'estimate' | 'project' | 'opportunity' | 'company' | 'contact';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

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

  // Load data on mount
  useEffect(() => {
    fetchProjects();
    fetchCompanies();
    fetchContacts();
  }, [fetchProjects, fetchCompanies, fetchContacts]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
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

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const queryLower = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    try {
      // Search Estimates
      const estimates = await estimatesRepo.list();
      estimates
        .filter((e: Estimate) => 
          e.title?.toLowerCase().includes(queryLower) ||
          e.reference?.toLowerCase().includes(queryLower)
        )
        .slice(0, 5)
        .forEach((estimate: Estimate) => {
          searchResults.push({
            id: estimate.id,
            type: 'estimate',
            title: estimate.title || 'Untitled Estimate',
            subtitle: `Status: ${estimate.status} • ${estimate.total ? `£${estimate.total.toLocaleString()}` : 'No value'}`,
            icon: FileText,
            url: `/estimating/${estimate.id}`,
          });
        });

      // Search Projects
      projects
        .filter((p: Project) =>
          p.name?.toLowerCase().includes(queryLower) ||
          p.reference?.toLowerCase().includes(queryLower) ||
          p.description?.toLowerCase().includes(queryLower)
        )
        .slice(0, 5)
        .forEach((project: Project) => {
          searchResults.push({
            id: project.id,
            type: 'project',
            title: project.name || 'Untitled Project',
            subtitle: `Status: ${project.status} • ${project.project_value ? `£${project.project_value.toLocaleString()}` : 'No value'}`,
            icon: FolderKanban,
            url: `/projects/${project.id}`,
          });
        });

      // Search Opportunities
      opportunities
        .filter((o: Opportunity) =>
          o.title?.toLowerCase().includes(queryLower) ||
          o.company?.toLowerCase().includes(queryLower) ||
          o.description?.toLowerCase().includes(queryLower)
        )
        .slice(0, 5)
        .forEach((opportunity: Opportunity) => {
          searchResults.push({
            id: opportunity.id,
            type: 'opportunity',
            title: opportunity.title || 'Untitled Opportunity',
            subtitle: `Stage: ${opportunity.stage} • ${opportunity.value ? `£${opportunity.value.toLocaleString()}` : 'No value'}`,
            icon: Target,
            url: `/opportunities`,
          });
        });

      // Search Companies
      companies
        .filter((c: Company) =>
          c.name?.toLowerCase().includes(queryLower) ||
          c.legal_name?.toLowerCase().includes(queryLower) ||
          c.email?.toLowerCase().includes(queryLower)
        )
        .slice(0, 5)
        .forEach((company: Company) => {
          searchResults.push({
            id: company.id,
            type: 'company',
            title: company.name || 'Untitled Company',
            subtitle: company.email || company.phone || 'No contact info',
            icon: Building2,
            url: `/companies`,
          });
        });

      // Search Contacts
      contacts
        .filter((c: Contact) =>
          c.first_name?.toLowerCase().includes(queryLower) ||
          c.last_name?.toLowerCase().includes(queryLower) ||
          c.email?.toLowerCase().includes(queryLower) ||
          c.phone?.toLowerCase().includes(queryLower)
        )
        .slice(0, 5)
        .forEach((contact: Contact) => {
          searchResults.push({
            id: contact.id,
            type: 'contact',
            title: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Untitled Contact',
            subtitle: contact.email || contact.phone || 'No contact info',
            icon: User,
            url: `/contacts`,
          });
        });

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
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
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

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

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
            placeholder="Search..."
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
              maxHeight: '400px', 
              overflowY: 'auto',
              zIndex: 1001,
              position: 'absolute'
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
          >
            {query && results.length > 0 ? (
              <div ref={resultsRef} className="p-2">
                {results.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                        'hover:bg-accent',
                        selectedIndex === index && 'bg-accent'
                      )}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize flex-shrink-0">
                        {result.type}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query && !isSearching ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>

  );
}
