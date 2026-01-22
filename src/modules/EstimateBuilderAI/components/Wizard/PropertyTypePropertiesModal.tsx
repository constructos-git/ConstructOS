// Property Type Properties Modal Component

import { useState, useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

export interface PropertyTypeProperties {
  propertyType?: string;
  propertyAge?: string;
  numberOfFloors?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  // Address fields
  address?: string; // Keep for backward compatibility
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  townCity?: string;
  county?: string;
  postcode?: string;
  notes?: string;
}

interface UKAddress {
  line_1: string;
  line_2?: string;
  line_3?: string;
  post_town: string;
  county?: string;
  postcode: string;
}

interface PropertyTypePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyTypeProperties;
  onSave: (properties: PropertyTypeProperties) => void;
}

export function PropertyTypePropertiesModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: PropertyTypePropertiesModalProps) {
  const [localProperties, setLocalProperties] = useState<PropertyTypeProperties>(properties);
  const [addressSuggestions, setAddressSuggestions] = useState<UKAddress[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const addressInputRef = useRef<HTMLInputElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addressAutocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingAddressRef = useRef(false);

  // Sync local properties when props change
  useEffect(() => {
    setLocalProperties(properties);
    // Build address search term from separate fields if available
    if (properties.addressLine1 || properties.addressLine2 || properties.townCity) {
      const addressParts = [
        properties.addressLine1,
        properties.addressLine2,
        properties.addressLine3,
        properties.townCity,
        properties.county,
      ].filter(Boolean);
      setAddressSearchTerm(addressParts.join(', ') || properties.address || '');
    } else {
      setAddressSearchTerm(properties.address || '');
    }
  }, [properties]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddressDropdown]);

  // Fetch addresses by postcode using UK-specific postcode lookup APIs
  const fetchAddressesByPostcode = async (postcode: string) => {
    if (!postcode || postcode.trim().length < 5) {
      setAddressSuggestions([]);
      setShowAddressDropdown(false);
      return;
    }

    setIsLoadingAddresses(true);
    setShowAddressDropdown(false);
    
    try {
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const formattedPostcode = cleanPostcode.length > 5 
        ? `${cleanPostcode.slice(0, -3)} ${cleanPostcode.slice(-3)}`
        : cleanPostcode;
      
      const getAddressApiKey = import.meta.env.VITE_GETADDRESS_API_KEY;
      
      if (getAddressApiKey) {
        try {
          const proxyUrl = `/api/getaddress/autocomplete/${encodeURIComponent(formattedPostcode)}`;
          
          const addrResponse = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });
          
          if (addrResponse.ok) {
            const addrData = await addrResponse.json();
            if (addrData.suggestions && Array.isArray(addrData.suggestions) && addrData.suggestions.length > 0) {
              const addresses: UKAddress[] = addrData.suggestions.map((suggestion: any) => {
                const addrString = suggestion.address || '';
                const parts = addrString.split(',').map((p: string) => p.trim());
                const postcodeMatch = addrString.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i);
                const extractedPostcode = postcodeMatch ? postcodeMatch[1] : formattedPostcode;
                const partsWithoutPostcode = parts.filter(p => !p.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i));
                
                const deduplicatedParts: string[] = [];
                for (let i = 0; i < partsWithoutPostcode.length; i++) {
                  if (i === 0 || partsWithoutPostcode[i] !== partsWithoutPostcode[i - 1]) {
                    deduplicatedParts.push(partsWithoutPostcode[i]);
                  }
                }
                
                let line_1 = '';
                let line_2 = '';
                let line_3 = '';
                let post_town = '';
                let county = '';
                
                if (deduplicatedParts.length === 0) {
                  // No parts
                } else if (deduplicatedParts.length === 1) {
                  line_1 = deduplicatedParts[0] || '';
                } else if (deduplicatedParts.length === 2) {
                  line_1 = deduplicatedParts[0] || '';
                  post_town = deduplicatedParts[1] || '';
                } else if (deduplicatedParts.length === 3) {
                  line_1 = deduplicatedParts[0] || '';
                  post_town = deduplicatedParts[1] || '';
                  county = deduplicatedParts[2] || '';
                } else if (deduplicatedParts.length === 4) {
                  line_1 = deduplicatedParts[0] || '';
                  line_2 = deduplicatedParts[1] || '';
                  post_town = deduplicatedParts[2] || '';
                  county = deduplicatedParts[3] || '';
                } else if (deduplicatedParts.length >= 5) {
                  line_1 = deduplicatedParts[0] || '';
                  line_2 = deduplicatedParts[1] || '';
                  line_3 = deduplicatedParts[2] || '';
                  post_town = deduplicatedParts[deduplicatedParts.length - 2] || '';
                  county = deduplicatedParts[deduplicatedParts.length - 1] || '';
                }
                
                return {
                  line_1,
                  line_2,
                  line_3,
                  post_town,
                  county,
                  postcode: extractedPostcode,
                };
              }).filter((addr: UKAddress) => addr.line_1 || addr.line_2);
              
              if (addresses.length > 0) {
                setAddressSuggestions(addresses);
                setShowAddressDropdown(true);
                setIsLoadingAddresses(false);
                return;
              }
            }
          }
        } catch (error) {
          console.warn('getAddress.io call failed:', error);
        }
      }
      
      // Fallback to Ideal Postcodes
      const idealPostcodesApiKey = import.meta.env.VITE_IDEAL_POSTCODES_API_KEY;
      if (idealPostcodesApiKey) {
        try {
          const idealResponse = await fetch(
            `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(cleanPostcode)}?api_key=${idealPostcodesApiKey}`
          );
          
          if (idealResponse.ok) {
            const idealData = await idealResponse.json();
            if (idealData.result && Array.isArray(idealData.result) && idealData.result.length > 0) {
              const addresses: UKAddress[] = idealData.result.map((addr: any) => ({
                line_1: addr.line_1 || addr.organisation_name || '',
                line_2: addr.line_2 || '',
                line_3: addr.line_3 || '',
                post_town: addr.post_town || '',
                postcode: addr.postcode || cleanPostcode,
              })).filter((addr: UKAddress) => addr.line_1 || addr.line_2);
              
              if (addresses.length > 0) {
                setAddressSuggestions(addresses);
                setShowAddressDropdown(true);
                setIsLoadingAddresses(false);
                return;
              }
            }
          }
        } catch (error) {
          console.warn('Ideal Postcodes failed:', error);
        }
      }
      
      setAddressSuggestions([]);
      setShowAddressDropdown(false);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressSuggestions([]);
      setShowAddressDropdown(false);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handlePostcodeChange = (postcode: string) => {
    if (isSelectingAddressRef.current) return;
    
    setLocalProperties({ ...localProperties, postcode });
    setAddressSearchTerm('');
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (postcode.trim().length >= 5) {
        fetchAddressesByPostcode(postcode);
      } else {
        setAddressSuggestions([]);
        setShowAddressDropdown(false);
      }
    }, 500);
  };

  const handleAddressSelect = (address: UKAddress) => {
    isSelectingAddressRef.current = true;
    
    const addressParts = [
      address.line_1,
      address.line_2,
      address.line_3,
      address.post_town,
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    
    setShowAddressDropdown(false);
    setAddressSuggestions([]);
    
    let addressLine1 = address.line_1 || '';
    let addressLine2 = address.line_2 || '';
    let addressLine3 = address.line_3 || '';
    let townCity = address.post_town || '';
    let county = address.county || '';
    
    if (addressLine2 && addressLine2.toLowerCase() === townCity.toLowerCase()) {
      addressLine2 = '';
    }
    if (addressLine3) {
      if (addressLine3.toLowerCase() === townCity.toLowerCase() || 
          (county && addressLine3.toLowerCase() === county.toLowerCase())) {
        addressLine3 = '';
      }
    }
    
    setLocalProperties({
      ...localProperties,
      address: fullAddress,
      addressLine1,
      addressLine2,
      addressLine3,
      townCity,
      county,
      postcode: address.postcode || localProperties.postcode,
    });
    setAddressSearchTerm(fullAddress);
    
    setTimeout(() => {
      isSelectingAddressRef.current = false;
    }, 100);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localProperties);
    onClose();
  };

  const handleCancel = () => {
    setLocalProperties(properties);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pt-16 pb-4 px-4">
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl">Property Type Properties</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Type (read-only) */}
          {localProperties.propertyType && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Selected Property Type</label>
                <Tooltip content="The property type you selected in the wizard">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium capitalize">
                {localProperties.propertyType.replace(/-/g, ' ')}
              </div>
            </div>
          )}

          {/* Property Age */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="propertyAge" className="text-sm font-medium">Property Age</label>
              <Tooltip content="Approximate age or era of the property">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="propertyAge"
              value={localProperties.propertyAge || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, propertyAge: e.target.value })}
              placeholder="e.g., Victorian, 1930s, 1980s, New Build"
            />
          </div>

          {/* Number of Floors */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="numberOfFloors" className="text-sm font-medium">Number of Floors</label>
              <Tooltip content="Total number of floors in the property">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="numberOfFloors"
              type="number"
              min="1"
              value={localProperties.numberOfFloors || ''}
              onChange={(e) => setLocalProperties({ 
                ...localProperties, 
                numberOfFloors: e.target.value ? parseInt(e.target.value, 10) : undefined 
              })}
              placeholder="e.g., 2"
            />
          </div>

          {/* Number of Bedrooms */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="numberOfBedrooms" className="text-sm font-medium">Number of Bedrooms</label>
              <Tooltip content="Total number of bedrooms in the property">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="numberOfBedrooms"
              type="number"
              min="0"
              value={localProperties.numberOfBedrooms || ''}
              onChange={(e) => setLocalProperties({ 
                ...localProperties, 
                numberOfBedrooms: e.target.value ? parseInt(e.target.value, 10) : undefined 
              })}
              placeholder="e.g., 3"
            />
          </div>

          {/* Number of Bathrooms */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="numberOfBathrooms" className="text-sm font-medium">Number of Bathrooms</label>
              <Tooltip content="Total number of bathrooms in the property">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="numberOfBathrooms"
              type="number"
              min="0"
              value={localProperties.numberOfBathrooms || ''}
              onChange={(e) => setLocalProperties({ 
                ...localProperties, 
                numberOfBathrooms: e.target.value ? parseInt(e.target.value, 10) : undefined 
              })}
              placeholder="e.g., 2"
            />
          </div>

          {/* Address Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Property Address</h3>
            
            {/* Postcode */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="postcode" className="text-sm font-medium">Postcode</label>
                <Tooltip content="UK postcode for the property. Enter a postcode to see available addresses.">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="postcode"
                  value={localProperties.postcode || ''}
                  onChange={(e) => handlePostcodeChange(e.target.value)}
                  placeholder="e.g., SW1A 1AA"
                  className="pr-10"
                />
                {isLoadingAddresses && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Address Search */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="addressSearch" className="text-sm font-medium">Search Address</label>
                <Tooltip content="Enter postcode first to see suggestions, or type to search for an address.">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  ref={addressInputRef}
                  id="addressSearch"
                  value={addressSearchTerm}
                  onChange={(e) => {
                    setAddressSearchTerm(e.target.value);
                    setLocalProperties({ ...localProperties, address: e.target.value });
                  }}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowAddressDropdown(true);
                    }
                  }}
                  placeholder="Enter postcode first, or type address to search"
                />
                
                {showAddressDropdown && addressSuggestions.length > 0 && (
                  <div
                    ref={addressDropdownRef}
                    className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border-2 border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 shadow-xl"
                    style={{ top: '100%', left: 0, right: 0, marginTop: '4px' }}
                  >
                    {addressSuggestions.map((address, index) => {
                      const addressParts = [
                        address.line_1,
                        address.line_2,
                        address.line_3,
                        address.post_town,
                        address.county,
                      ].filter(Boolean);
                      const fullAddress = addressParts.join(', ');
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddressSelect(address);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">{fullAddress}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{address.postcode}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="addressLine1" className="text-sm font-medium">Address Line 1</label>
                <Tooltip content="Usually house name or number">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="addressLine1"
                value={localProperties.addressLine1 || ''}
                onChange={(e) => setLocalProperties({ ...localProperties, addressLine1: e.target.value })}
                placeholder="123 Oak Street"
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="addressLine2" className="text-sm font-medium">Address Line 2</label>
                <Tooltip content="Usually Street/Road name">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="addressLine2"
                value={localProperties.addressLine2 || ''}
                onChange={(e) => setLocalProperties({ ...localProperties, addressLine2: e.target.value })}
                placeholder="Maple Avenue"
              />
            </div>

            {/* Address Line 3 */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="addressLine3" className="text-sm font-medium">Address Line 3</label>
                <Tooltip content="Additional address information (optional)">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="addressLine3"
                value={localProperties.addressLine3 || ''}
                onChange={(e) => setLocalProperties({ ...localProperties, addressLine3: e.target.value })}
                placeholder="Optional additional information"
              />
            </div>

            {/* Town/City */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="townCity" className="text-sm font-medium">Town/City</label>
                <Tooltip content="Town or city name">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="townCity"
                value={localProperties.townCity || ''}
                onChange={(e) => setLocalProperties({ ...localProperties, townCity: e.target.value })}
                placeholder="London"
              />
            </div>

            {/* County */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="county" className="text-sm font-medium">County</label>
                <Tooltip content="County name">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="county"
                value={localProperties.county || ''}
                onChange={(e) => setLocalProperties({ ...localProperties, county: e.target.value })}
                placeholder="Greater London"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Additional Notes</label>
              <Tooltip content="Any additional notes or information about the property">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <textarea
              id="notes"
              value={localProperties.notes || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, notes: e.target.value })}
              placeholder="Any additional notes or information about the property"
              className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
