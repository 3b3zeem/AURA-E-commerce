export interface GovernorateShipping {
  id: string;
  name: string;
  nameAr: string;
  fee: number;
  estDays: string;
}

export const EGYPTIAN_GOVERNORATES: GovernorateShipping[] = [
  { id: 'cairo', name: 'Cairo', nameAr: 'القاهرة', fee: 50, estDays: '1-2 Business Days' },
  { id: 'giza', name: 'Giza', nameAr: 'الجيزة', fee: 50, estDays: '1-2 Business Days' },
  { id: 'qalyubia', name: 'Qalyubia', nameAr: 'القليوبية', fee: 60, estDays: '1-2 Business Days' },
  { id: 'alexandria', name: 'Alexandria', nameAr: 'الإسكندرية', fee: 75, estDays: '2 Business Days' },
  { id: 'dakahlia', name: 'Dakahlia (Mansoura)', nameAr: 'الدقهلية (المنصورة)', fee: 90, estDays: '2-3 Business Days' },
  { id: 'gharbia', name: 'Gharbia (Tanta)', nameAr: 'الغربية (طنطا)', fee: 90, estDays: '2-3 Business Days' },
  { id: 'sharqia', name: 'Sharqia (Zagazig)', nameAr: 'الشرقية (الزقازيق)', fee: 90, estDays: '2-3 Business Days' },
  { id: 'monufia', name: 'Monufia', nameAr: 'المنوفية', fee: 90, estDays: '2-3 Business Days' },
  { id: 'beheira', name: 'Beheira', nameAr: 'البحيرة', fee: 90, estDays: '2-3 Business Days' },
  { id: 'damietta', name: 'Damietta', nameAr: 'دمياط', fee: 90, estDays: '2-3 Business Days' },
  { id: 'kafr_el_sheikh', name: 'Kafr El Sheikh', nameAr: 'كفر الشيخ', fee: 90, estDays: '2-3 Business Days' },
  { id: 'port_said', name: 'Port Said', nameAr: 'بورسعيد', fee: 100, estDays: '2-3 Business Days' },
  { id: 'ismailia', name: 'Ismailia', nameAr: 'الإسماعيلية', fee: 100, estDays: '2-3 Business Days' },
  { id: 'suez', name: 'Suez', nameAr: 'السويس', fee: 100, estDays: '2-3 Business Days' },
  { id: 'fayoum', name: 'Fayoum', nameAr: 'الفيوم', fee: 90, estDays: '2-3 Business Days' },
  { id: 'beni_suef', name: 'Beni Suef', nameAr: 'بني سويف', fee: 100, estDays: '2-3 Business Days' },
  { id: 'minya', name: 'Minya', nameAr: 'المنيا', fee: 110, estDays: '3-4 Business Days' },
  { id: 'asyut', name: 'Asyut', nameAr: 'أسيوط', fee: 110, estDays: '3-4 Business Days' },
  { id: 'sohag', name: 'Sohag', nameAr: 'سوهاج', fee: 120, estDays: '3-4 Business Days' },
  { id: 'qena', name: 'Qena', nameAr: 'قنا', fee: 120, estDays: '3-4 Business Days' },
  { id: 'luxor', name: 'Luxor', nameAr: 'الأقصر', fee: 120, estDays: '3-4 Business Days' },
  { id: 'aswan', name: 'Aswan', nameAr: 'أسوان', fee: 130, estDays: '3-5 Business Days' },
  { id: 'red_sea', name: 'Red Sea (Hurghada)', nameAr: 'البحر الأحمر (الغردقة)', fee: 140, estDays: '3-5 Business Days' },
  { id: 'south_sinai', name: 'South Sinai (Sharm)', nameAr: 'جنوب سيناء (شرم الشيخ)', fee: 150, estDays: '3-5 Business Days' },
];

export const FREE_SHIPPING_THRESHOLD = 2000; // Free shipping for subtotal >= 2000 EGP

export function getShippingFee(governorateName: string, subtotal: number): { fee: number; isFree: boolean; estDays: string } {
  if (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0) {
    const gov = EGYPTIAN_GOVERNORATES.find(
      g => g.name.toLowerCase() === governorateName.toLowerCase() || g.nameAr === governorateName
    ) || EGYPTIAN_GOVERNORATES[0];
    return { fee: 0, isFree: true, estDays: gov.estDays };
  }

  const found = EGYPTIAN_GOVERNORATES.find(
    g => g.name.toLowerCase().includes(governorateName.toLowerCase()) || 
         governorateName.toLowerCase().includes(g.id) ||
         g.nameAr === governorateName
  );

  if (found) {
    return { fee: found.fee, isFree: false, estDays: found.estDays };
  }

  // Default Cairo fee
  return { fee: 50, isFree: false, estDays: '1-2 Business Days' };
}

export interface DynamicDeliveryEstimate {
  deliveryText: string;
  isTomorrow: boolean;
  hoursLeft: number;
  minsLeft: number;
  formattedCountdown: string;
  formattedStandardDate: string;
  estDays: string;
  governorateName: string;
}

export function getActiveGovernorate(): string {
  if (typeof window !== 'undefined') {
    try {
      const active = localStorage.getItem('aura_active_governorate');
      if (active) return active;
    } catch (e) {}
  }
  return 'Cairo';
}

export function setActiveGovernorate(name: string) {
  if (typeof window !== 'undefined' && name) {
    try {
      localStorage.setItem('aura_active_governorate', name);
      window.dispatchEvent(new Event('aura_governorate_selected'));
    } catch (e) {}
  }
}

export function getStoredGovernorates(): GovernorateShipping[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('aura_governorates');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return EGYPTIAN_GOVERNORATES;
}

export function saveStoredGovernorates(list: GovernorateShipping[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('aura_governorates', JSON.stringify(list));
      window.dispatchEvent(new Event('aura_governorates_changed'));
    } catch (e) {
      console.error(e);
    }
  }
}

export function calculateExpressDelivery(
  cutoffHour = 17,
  governorateName?: string,
  customGovList?: GovernorateShipping[]
): DynamicDeliveryEstimate {
  const targetGovName = governorateName || getActiveGovernorate();
  const govList = customGovList || getStoredGovernorates();
  const gov = govList.find(
    g => g.name.toLowerCase().includes(targetGovName.toLowerCase()) || 
         targetGovName.toLowerCase().includes(g.id) ||
         g.nameAr === targetGovName
  ) || govList[0];

  const now = new Date();
  const currentHour = now.getHours();

  let minDays = 2;
  if (gov?.estDays?.includes('1-2')) minDays = 1;
  else if (gov?.estDays?.includes('2 Business')) minDays = 2;
  else if (gov?.estDays?.includes('2-3')) minDays = 2;
  else if (gov?.estDays?.includes('3-4')) minDays = 3;
  else if (gov?.estDays?.includes('3-5')) minDays = 3;

  const standardDate = new Date(now);
  standardDate.setDate(now.getDate() + minDays + 1);
  const formattedStandardDate = standardDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const isEligibleForTomorrow = minDays === 1 && currentHour < cutoffHour;

  if (isEligibleForTomorrow) {
    const hoursLeft = cutoffHour - currentHour - 1;
    const minsLeft = 60 - now.getMinutes();
    return {
      deliveryText: `Tomorrow`,
      isTomorrow: true,
      hoursLeft,
      minsLeft,
      formattedCountdown: `${hoursLeft} hrs ${minsLeft} mins`,
      formattedStandardDate,
      estDays: gov.estDays,
      governorateName: gov.nameAr,
    };
  } else {
    const fastestDate = new Date(now);
    fastestDate.setDate(now.getDate() + minDays);
    const formattedNextFastest = fastestDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    return {
      deliveryText: formattedNextFastest,
      isTomorrow: false,
      hoursLeft: 0,
      minsLeft: 0,
      formattedCountdown: "Order ready for dispatch",
      formattedStandardDate,
      estDays: gov.estDays,
      governorateName: gov.nameAr,
    };
  }
}


