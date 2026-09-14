export const DEMO_ADDRESSES = {
  primary:
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",

  secondary:
    "0x91A7F4A9c03f6E41E7e0e14c9A2F6e3F4E53f02A",

  borrowerTwo:
    "0x3B4E92D7A10178aE5eD42A83A10aB3c9A7D8E1F2",

  lender:
    "0x8A4C9D2B1E7F0A3F9A1B7C2D6E4F8A9B0C2D3E4F",
} as const;

export const DEMO_TRANSACTIONS = [
  "0x4d9f61be92ac812c",
  "0x88ab2fd1e1c41f20",
  "0xaf31ea7422bb1aa12",
  "0x8b1c92a14f8172ff",
  "0x2dc8e7a90b401f32",
  "0xe18a9f204f7a93cc",
  "0x72ca1bc2e9fa7180",
  "0x91c7e4a820bfc2a1",
];

export const DEMO_CHAINS = {
  ethereumSepolia: {
    name: "Ethereum Sepolia",
    chainId: 11155111,
  },
  ethereumMainnet: {
    name: "Ethereum Mainnet",
    chainId: 1,
  },
  polygonAmoy: {
    name: "Polygon Amoy",
    chainId: 80002,
  },
} as const;

export const DEMO_MODEL_VERSION = "underwriter-v3.2";

export const DEMO_FEATURE_VERSION = "features-v2.1";

export const DEMO_POLICY_VERSION = "riskguard-v2.4";
