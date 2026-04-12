import { Injectable, Logger } from '@nestjs/common';

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
  display_name: string;
}

export interface ResolvedLocation {
  city: string;
  state: string;
  country: string;
  neighborhood: string | null;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  async reverseGeocode(lat: number, lng: number): Promise<ResolvedLocation> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'coleta-service/1.0 (garbage-collection-scheduler)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Nominatim returned ${response.status} for (${lat}, ${lng})`,
      );
    }

    const data = (await response.json()) as NominatimResponse;
    const addr = data.address;

    const city =
      addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? '';

    const neighborhood =
      addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? null;

    const state = addr.state ?? '';
    const country = addr.country ?? '';

    this.logger.debug(
      `Geocoded (${lat}, ${lng}) → ${city}, ${state}, ${country} / ${neighborhood ?? 'no neighborhood'}`,
    );

    return { city, state, country, neighborhood };
  }
}
