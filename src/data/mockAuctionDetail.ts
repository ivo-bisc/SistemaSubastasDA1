export type AuctionBidEntry = {
  id: string;
  bidderName: string;
  timeAgo: string;
  amount: number;
  avatarColor: string;
};

export type AuctionDetailData = {
  id: string;
  title: string;
  imageUrl: string;
  sellerName: string;
  sellerAvatarColor: string;
  status: string;
  categories: string[];
  description: string;
  initialPrice: number;
  lastBid: number;
  currency: string;
  timeRemaining: string;
  offerCount: number;
  isLive: boolean;
  quickBidAmounts: number[];
  bids: AuctionBidEntry[];
};

export const MOCK_AUCTION_DETAIL: AuctionDetailData = {
  id: 'auction-1',
  title: 'Love of Soul Z500',
  imageUrl:
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
  sellerName: 'Milinda Peterson',
  sellerAvatarColor: '#7B68EE',
  status: 'Near mint',
  categories: ['Ropa', 'Zapatillas'],
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.',
  initialPrice: 5000,
  lastBid: 24500,
  currency: 'USD',
  timeRemaining: '01: 23s restantes',
  offerCount: 14,
  isLive: true,
  quickBidAmounts: [26000, 28000, 32000, 35000],
  bids: [
    {
      id: 'b1',
      bidderName: 'Jennifer Richards',
      timeAgo: '20s',
      amount: 24500,
      avatarColor: '#E57373',
    },
    {
      id: 'b2',
      bidderName: 'Cameron Williamson',
      timeAgo: '1m',
      amount: 20000,
      avatarColor: '#64B5F6',
    },
    {
      id: 'b3',
      bidderName: 'Ellie Hawkins',
      timeAgo: '28s',
      amount: 23500,
      avatarColor: '#81C784',
    },
    {
      id: 'b4',
      bidderName: 'Robert Fox',
      timeAgo: '45s',
      amount: 23000,
      avatarColor: '#FFB74D',
    },
    {
      id: 'b5',
      bidderName: 'Jane Cooper',
      timeAgo: '1m',
      amount: 22000,
      avatarColor: '#BA68C8',
    },
  ],
};
