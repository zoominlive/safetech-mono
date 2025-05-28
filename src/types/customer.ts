export interface LocationData {
  id?: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
  active?: boolean;
}

export interface CustomerData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: boolean;
  locations?: LocationData[];
}
