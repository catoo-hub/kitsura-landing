import type { UserData, PaymentMethod } from "./miniapp-api";

export const MOCK_USER_DATA: UserData = {
  user: {
    id: 123456789,
    username: "test_user",
    first_name: "Test",
    last_name: "User",
    language_code: "ru",
    language: "ru",
  },
  balance: 1500,
  balance_currency: "RUB",
  subscription_url: "vless://uuid@1.2.3.4:443?security=reality&sni=google.com&fp=chrome&pbk=public_key&sid=short_id&type=grpc&serviceName=grpc#KitsuraVPN",
  subscription_crypto_link: "https://example.com/crypto-config",
  subscription_missing: false,
  autopay: true,
  trial_available: false,
  trial_duration_days: 3,
  referral: {
    code: "REF123",
    link: "https://t.me/bot?start=REF123",
    stats: {
      invited_count: 5,
      earned_total: 500,
      earned_month: 150,
      balance: 200,
    },
  },
  happ: {
    link: "https://example.com/happ",
  },
  servers: [
    { id: "ru", name: "Russia", country_code: "RU", flag: "🇷🇺" },
    { id: "nl", name: "Netherlands", country_code: "NL", flag: "🇳🇱" },
  ],
  devices: [
    { id: 1, name: "iPhone 13", last_active: "2023-10-27T10:00:00Z" },
    { id: 2, name: "Windows PC", last_active: "2023-10-26T15:30:00Z" },
  ],
};

export const MOCK_PURCHASE_OPTIONS = {
  currency: "RUB",
  balance_kopeks: 150000,
  periods: [
    {
      id: 1,
      months: 1,
      price_kopeks: 13500,
      final_price_kopeks: 13500,
      discount_percent: 0,
      label: "1 месяц",
    },
    {
      id: 3,
      months: 3,
      price_kopeks: 38000,
      final_price_kopeks: 38000,
      discount_percent: 5,
      label: "3 месяца",
    },
    {
      id: 6,
      months: 6,
      price_kopeks: 74000,
      final_price_kopeks: 74000,
      discount_percent: 10,
      label: "6 месяцев",
    },
    {
      id: 12,
      months: 12,
      price_kopeks: 142000,
      final_price_kopeks: 142000,
      discount_percent: 15,
      label: "1 год",
    },
  ],
  servers: {
    available: [
      { uuid: "ru", name: "Russia", country_code: "RU", flag: "🇷🇺", price_kopeks: 0 },
      { uuid: "nl", name: "Netherlands", country_code: "NL", flag: "🇳🇱", price_kopeks: 0 },
      { uuid: "de", name: "Germany", country_code: "DE", flag: "🇩🇪", price_kopeks: 0 },
      { uuid: "us", name: "USA", country_code: "US", flag: "🇺🇸", price_kopeks: 0 },
    ],
    min: 1,
    max: 5,
  },
};

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    title: "Банковская карта",
    description: "RF cards only",
    icon: "card",
    currency: "RUB",
    min_amount_kopeks: 10000,
    max_amount_kopeks: 5000000,
  },
  {
    id: "crypto",
    title: "Криптовалюта",
    description: "USDT, BTC, ETH",
    icon: "bitcoin",
    currency: "USD",
  },
];
