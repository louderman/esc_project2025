export const AMENITY_TO_SVG = {
  airConditioning: 'ac_unit.svg',
  parkingGarage: 'garage.svg',
  businessCenter: 'business_centre.svg',
  clothingIron: 'iron.svg',
  inHouseBar: 'local_bar.svg',
  inHouseDining: 'fork_spoon.svg',
  miniBarInRoom: 'local_bar.svg',
  outdoorPool: 'pool.svg',
  roomService: 'room_service.svg',
  sauna: 'sauna.svg',
  tVInRoom: 'tv.svg',
  continentalBreakfast: 'fork_spoon.svg',
  kitchen: 'kitchen.svg',
};

export type AmenityKey = keyof typeof AMENITY_TO_SVG;

export const AMENITY_KEYS: AmenityKey[] = Object.keys(
  AMENITY_TO_SVG
) as AmenityKey[];
