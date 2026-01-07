// Measurements Repository

import { supabase } from '@/lib/supabase';
import type { EstimateMeasurements } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const measurementsRepo = {
  async get(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_measurements')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      estimate_id: data.estimate_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      externalLengthM: data.external_length_m || 0,
      externalWidthM: data.external_width_m || 0,
      eavesHeightM: data.eaves_height_m || 2.4,
      floorAreaM2: data.floor_area_m2 || 0,
      perimeterM: data.perimeter_m || 0,
      externalWallAreaM2: data.external_wall_area_m2 || 0,
      roofAreaM2: data.roof_area_m2 || 0,
      roofFactor: data.roof_factor || 1.05,
    } as EstimateMeasurements & { id: string; estimate_id: string; created_at: string; updated_at: string };
  },

  async create(companyId: string | null | undefined, estimateId: string, measurements: EstimateMeasurements) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_measurements')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        external_length_m: measurements.externalLengthM,
        external_width_m: measurements.externalWidthM,
        eaves_height_m: measurements.eavesHeightM,
        floor_area_m2: measurements.floorAreaM2,
        perimeter_m: measurements.perimeterM,
        external_wall_area_m2: measurements.externalWallAreaM2,
        roof_area_m2: measurements.roofAreaM2,
        roof_factor: measurements.roofFactor,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, estimateId: string, measurements: Partial<EstimateMeasurements>) {
    const cid = getCompanyId(companyId);
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (measurements.externalLengthM !== undefined) updateData.external_length_m = measurements.externalLengthM;
    if (measurements.externalWidthM !== undefined) updateData.external_width_m = measurements.externalWidthM;
    if (measurements.eavesHeightM !== undefined) updateData.eaves_height_m = measurements.eavesHeightM;
    if (measurements.floorAreaM2 !== undefined) updateData.floor_area_m2 = measurements.floorAreaM2;
    if (measurements.perimeterM !== undefined) updateData.perimeter_m = measurements.perimeterM;
    if (measurements.externalWallAreaM2 !== undefined) updateData.external_wall_area_m2 = measurements.externalWallAreaM2;
    if (measurements.roofAreaM2 !== undefined) updateData.roof_area_m2 = measurements.roofAreaM2;
    if (measurements.roofFactor !== undefined) updateData.roof_factor = measurements.roofFactor;

    const { data, error } = await supabase
      .from('estimate_builder_ai_measurements')
      .update(updateData)
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
};

