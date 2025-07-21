export type Hotel = {
  id: string;
  imageCount: number;
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  address1: string;
  rating: number;
  distance: number;
  trustyou: {
    id: string;
    score: {
      overall: number | null;
      kaligo_overall: number | null;
      solo: number | null;
      couple: number | null;
      family: number | null;
      business: number | null;
    };
  };
  categories: {
    overall?: {
      name: string | null;
      score: number | null;
      popularity: number | null;
    };
    city_hotel?: {
      name: string | null;
      score: number | null;
      popularity: number | null;
    };
    romantic_hotel?: {
      name: string | null;
      score: number | null;
      popularity: number | null;
    };
    family_hotel?: {
      name: string | null;
      score: number | null;
      popularity: number | null;
    };
    business_hotel?: {
      name: string | null;
      score: number | null;
      popularity: number | null;
    };
  } & {
    [key: `${string}_hotel`]:
      | {
          name: string | null;
          score: number | null;
          popularity: number | null;
        }
      | undefined;
  };
  amenities_ratings: {
    name: string;
    score: number;
  }[];
  description: string;
  original_metadata?: {
    name: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  };
  amenities: Emenities;
  image_details: {
    suffix: string;
    count: number;
    prefix: string;
  };
  hires_image_index: string;
  number_of_images: number;
  default_image_index: number;
  imgix_url: string;
  cloudflare_image_url: string;
  checkin_time: string;
  rank?: string;
};

export type Emenities = {
  airConditioning?: boolean;
  dataPorts?: boolean;
  parkingGarage?: boolean;
  safe?: boolean;
  businessCenter?: boolean;
  childrenAllowed?: boolean;
  clothingIron?: boolean;
  dryCleaning?: boolean;
  hairDryer?: boolean;
  inHouseBar?: boolean;
  inHouseDining?: boolean;
  meetingRooms?: boolean;
  miniBarInRoom?: boolean;
  outdoorPool?: boolean;
  roomService?: boolean;
  sauna?: boolean;
  tVInRoom?: boolean;
  voiceMail?: boolean;
  continentalBreakfast?: boolean;
  kitchen?: boolean;
};