import { Edit, Calendar, User, Building2, Tag, PoundSterling, Percent, Target, MapPin, Navigation } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Opportunity } from '@/types/opportunities';
import { format } from 'date-fns';

interface OpportunityDetailProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (opportunity: Opportunity) => void;
}

export default function OpportunityDetail({
  opportunity,
  isOpen,
  onClose,
  onEdit,
}: OpportunityDetailProps) {
  if (!opportunity) return null;

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (probability >= 25) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getFullAddress = (opp: Opportunity): string => {
    const parts = [
      opp.addressLine1,
      opp.addressLine2,
      opp.addressLine3,
      opp.townCity,
      opp.county,
      opp.postcode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getGoogleMapsUrl = (address: string): string => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&key=${apiKey}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getAppleMapsUrl = (address: string): string => {
    return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  };

  const getWazeUrl = (address: string): string => {
    return `https://waze.com/ul?q=${encodeURIComponent(address)}`;
  };

  const hasAddress = (opp: Opportunity): boolean => {
    return !!(opp.addressLine1 || opp.postcode || opp.townCity);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity.title}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(opportunity);
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
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{opportunity.title}</h2>
            <p className="text-muted-foreground mt-1">{opportunity.company}</p>
          </div>
          <Badge
            variant="secondary"
            className={`text-sm font-semibold ${getProbabilityColor(opportunity.probability)}`}
          >
            {opportunity.probability}% Probability
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PoundSterling className="h-4 w-4" />
              <span className="text-sm font-medium">Value</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(opportunity.value, opportunity.currency)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Stage</span>
            </div>
            <p className="text-2xl font-bold capitalize">{opportunity.stage}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Percent className="h-4 w-4" />
              <span className="text-sm font-medium">Win Probability</span>
            </div>
            <p className="text-2xl font-bold">{opportunity.probability}%</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Details</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {opportunity.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{opportunity.contact}</span>
                </div>
              )}
              {opportunity.assignedTo && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span className="font-medium">{opportunity.assignedTo}</span>
                </div>
              )}
              {opportunity.expectedCloseDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expected Close:</span>
                  <span className="font-medium">
                    {format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {opportunity.source && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{opportunity.source}</span>
                </div>
              )}
            </div>
          </div>

          {opportunity.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </div>
          )}

          {opportunity.tags && opportunity.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Customer Address Section */}
          {hasAddress(opportunity) && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Customer Address
              </h3>
              <div className="space-y-4">
                {/* Address Display */}
                <div className="rounded-lg border p-4 bg-muted/30">
                  <div className="text-sm space-y-1">
                    {opportunity.addressLine1 && <p className="font-medium">{opportunity.addressLine1}</p>}
                    {opportunity.addressLine2 && <p>{opportunity.addressLine2}</p>}
                    {opportunity.addressLine3 && <p>{opportunity.addressLine3}</p>}
                    {opportunity.townCity && <p>{opportunity.townCity}</p>}
                    {opportunity.county && <p>{opportunity.county}</p>}
                    {opportunity.postcode && <p className="font-semibold">{opportunity.postcode}</p>}
                  </div>
                </div>

                {/* Map Embed */}
                <div className="rounded-lg border overflow-hidden" style={{ height: '300px' }}>
                  {(() => {
                    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                    const address = getFullAddress(opportunity);
                    if (apiKey) {
                      return (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`}
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <div className="text-center p-4">
                            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Google Maps API key not configured
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getGoogleMapsUrl(address), '_blank')}
                            >
                              View on Google Maps
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Directions Buttons */}
                <div>
                  <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <Navigation className="h-3 w-3" />
                    Get Directions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getGoogleMapsUrl(getFullAddress(opportunity)), '_blank')}
                    >
                      <MapPin className="h-3 w-3 mr-2" />
                      Google Maps
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getAppleMapsUrl(getFullAddress(opportunity)), '_blank')}
                    >
                      <MapPin className="h-3 w-3 mr-2" />
                      Apple Maps
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getWazeUrl(getFullAddress(opportunity)), '_blank')}
                    >
                      <MapPin className="h-3 w-3 mr-2" />
                      Waze
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>Created: {format(new Date(opportunity.createdAt), 'MMM d, yyyy')}</p>
            <p>Last Updated: {format(new Date(opportunity.updatedAt), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
