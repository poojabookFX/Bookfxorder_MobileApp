// Partner cards listed on bookfxorder.com/credit-cards.

export type CardCategory = 'cashback' | 'travel' | 'rewards' | 'utility' | 'free';

export type CreditCard = {
  id: string;
  name: string;
  bank: string;
  rating: number;
  spotlight: string;
  benefits: string[];
  annualFee: string;
  minMonthlyIncome: number;
  categories: CardCategory[];
  color: string;
};

export const CARD_FILTERS: { value: CardCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'travel', label: 'Travel & Lounge' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'utility', label: 'Daily Utility' },
  { value: 'free', label: 'Zero Annual Fee' },
];

export const CREDIT_CARDS: CreditCard[] = [
  {
    id: 'hdfc-regalia-gold',
    name: 'Regalia Gold Credit Card',
    bank: 'HDFC Bank',
    rating: 4.8,
    spotlight: '12 Complimentary Airport Lounge Visits (Domestic & Intl)',
    benefits: [
      'Complimentary Club Vistara Silver & MMT Black Elite memberships.',
      '5x Reward Points on dining, flight & hotel bookings via SmartBuy.',
      '₹1,500 flight vouchers on milestone spends of ₹1.5 Lakhs quarterly.',
    ],
    annualFee: '₹2,500 (waivable)',
    minMonthlyIncome: 100000,
    categories: ['travel', 'rewards'],
    color: '#1B2A4A',
  },
  {
    id: 'icici-amazon-pay',
    name: 'Amazon Pay Credit Card',
    bank: 'ICICI Bank',
    rating: 4.9,
    spotlight: '5% Unlimited Cashback on Amazon for Prime Members',
    benefits: [
      '100% paperless registration and instant card allocation for eligible users.',
      'Cashback credited as Amazon Pay Balance at the end of each billing cycle.',
      '1% fuel surcharge waiver at all petrol stations across India.',
    ],
    annualFee: 'Lifetime Free',
    minMonthlyIncome: 25000,
    categories: ['cashback', 'free'],
    color: '#B3541E',
  },
  {
    id: 'sbi-elite',
    name: 'SBI Card ELITE',
    bank: 'SBI Card',
    rating: 4.7,
    spotlight: 'Free Movie Tickets worth ₹6,000 every year',
    benefits: [
      'Welcome gift voucher worth ₹5,000 from top brands on joining fee payment.',
      '6 complimentary international lounge visits per year via Priority Pass.',
      'Up to 50,000 bonus Reward Points (worth ₹12,500) under annual milestones.',
    ],
    annualFee: '₹4,999 (waivable)',
    minMonthlyIncome: 120000,
    categories: ['rewards', 'travel'],
    color: '#1E3A8A',
  },
  {
    id: 'axis-ace',
    name: 'ACE Credit Card',
    bank: 'Axis Bank',
    rating: 4.8,
    spotlight: 'Flat 2% Cashback on all retail spends (No Upper Limit)',
    benefits: [
      'Unlimited cashback credited directly to your monthly statement.',
      '4 complimentary lounge visits per calendar year at domestic airports.',
      'Up to 20% discount at 4,000+ partner restaurants across India.',
    ],
    annualFee: '₹499 (waivable)',
    minMonthlyIncome: 30000,
    categories: ['cashback'],
    color: '#861F41',
  },
  {
    id: 'airtel-axis',
    name: 'Airtel Axis Credit Card',
    bank: 'Axis Bank',
    rating: 4.7,
    spotlight: '25% Cashback on Airtel Mobile, Broadband & DTH Bills',
    benefits: [
      'Save up to ₹3,600 annually on utility and mobile bill payments.',
      '4 complimentary domestic airport lounge visits per calendar year.',
      '1% fuel surcharge waiver for transactions between ₹400 and ₹4,000.',
    ],
    annualFee: '₹500 (waivable)',
    minMonthlyIncome: 25000,
    categories: ['utility', 'cashback'],
    color: '#C8102E',
  },
  {
    id: 'hsbc-cashback',
    name: 'HSBC Cashback Credit Card',
    bank: 'HSBC Bank',
    rating: 4.6,
    spotlight: '10% Cashback on Dining, Food Delivery & Groceries',
    benefits: [
      'No caps on the 1.5% flat-rate cashback tier — spend and earn freely.',
      'Introductory benefits worth up to ₹3,000 including Amazon & Swiggy vouchers.',
      'Complimentary domestic lounge visits (4 per year) and golf discounts.',
    ],
    annualFee: '₹999 (waivable)',
    minMonthlyIncome: 40000,
    categories: ['cashback', 'utility'],
    color: '#3F3F46',
  },
];
