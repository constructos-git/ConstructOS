// Calculation utilities for estimate totals

import type { InternalCosting, InternalCostingItem, InternalCostingSection } from '../domain/types';
import { roundMoney, calculateVat } from './money';

export function calculateItemTotal(item: InternalCostingItem): number {
  const baseTotal = item.quantity * item.unitPrice;
  const margin = roundMoney(baseTotal * (item.marginPercent / 100));
  const overhead = roundMoney(baseTotal * (item.overheadPercent / 100));
  const contingency = roundMoney(baseTotal * (item.contingencyPercent / 100));
  return roundMoney(baseTotal + margin + overhead + contingency);
}

export function calculateSectionTotal(section: InternalCostingSection): number {
  return section.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

export function calculateInternalCostingTotals(costing: InternalCosting): InternalCosting {
  // Calculate section totals
  const sectionsWithTotals = costing.sections.map((section) => ({
    ...section,
    total: calculateSectionTotal(section),
  }));

  // Calculate subtotal (sum of all section totals)
  const subtotal = sectionsWithTotals.reduce((sum, section) => sum + (section.total || 0), 0);

  // Calculate overhead, margin, contingency (these are typically applied at estimate level, not item level)
  // For now, we'll use the values from the costing object if provided, or calculate from items
  const overhead = roundMoney(subtotal * 0.10); // Default 10% overhead
  const margin = roundMoney(subtotal * 0.15); // Default 15% margin
  const contingency = roundMoney(subtotal * 0.05); // Default 5% contingency

  // Calculate VAT on subtotal + overhead + margin + contingency
  const vatBase = subtotal + overhead + margin + contingency;
  const vat = calculateVat(vatBase, 20); // Default 20% VAT

  // Total = subtotal + overhead + margin + contingency + VAT
  const total = roundMoney(vatBase + vat);

  return {
    ...costing,
    sections: sectionsWithTotals,
    subtotal,
    overhead,
    margin,
    contingency,
    vat,
    total,
  };
}

