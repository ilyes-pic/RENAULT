import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'TND',
    currencyDisplay: 'code',
  }).format(price).replace('TND', 'TND');
}

export function formatPartNumber(partNumber: string): string {
  return partNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZOR-${timestamp.slice(-6)}-${random}`;
}

export function extractEngineInfo(motorisation: string) {
  const patterns = {
    displacement: /(\d+\.?\d*)\s*(L|l|dCi|TCe|BlueHDi|HDi|VTi)/i,
    power: /(\d+)\s*(hp|ch|cv)/i,
    fuelType: /(diesel|essence|electric|hybrid|dci|hdi|bluehdi|tce|vti)/i,
  };

  const displacement = patterns.displacement.exec(motorisation)?.[1];
  const power = patterns.power.exec(motorisation)?.[1];
  const fuelMatch = patterns.fuelType.exec(motorisation)?.[1]?.toLowerCase();
  
  let fuelType = 'GASOLINE';
  if (fuelMatch?.includes('dci') || fuelMatch?.includes('hdi') || fuelMatch?.includes('diesel')) {
    fuelType = 'DIESEL';
  } else if (fuelMatch?.includes('electric')) {
    fuelType = 'ELECTRIC';
  } else if (fuelMatch?.includes('hybrid')) {
    fuelType = 'HYBRID';
  }

  return {
    displacement: displacement ? parseFloat(displacement) : null,
    power: power ? parseInt(power) : null,
    fuelType,
  };
}