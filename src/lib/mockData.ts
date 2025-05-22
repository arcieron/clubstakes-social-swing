
// Mock data for ClubStakes app

export const mockClubs = [
  {
    id: 'club1',
    name: 'Riviera Country Club',
    inviteCode: 'RIVIERA2024',
    adminId: 'user1'
  },
  {
    id: 'club2',
    name: 'Pebble Beach Golf Links',
    inviteCode: 'PEBBLE2024',
    adminId: 'user5'
  }
];

export const mockUsers = [
  {
    id: 'user1',
    email: 'admin@riviera.com',
    fullName: 'John Smith',
    clubId: 'club1',
    clubName: 'Riviera Country Club',
    ghinId: '12345678',
    handicap: 8,
    credits: 12500,
    isAdmin: true,
    joinedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user2',
    email: 'mike@riviera.com',
    fullName: 'Mike Johnson',
    clubId: 'club1',
    clubName: 'Riviera Country Club',
    ghinId: '23456789',
    handicap: 12,
    credits: 9800,
    isAdmin: false,
    joinedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user3',
    email: 'sarah@riviera.com',
    fullName: 'Sarah Davis',
    clubId: 'club1',
    clubName: 'Riviera Country Club',
    ghinId: '34567890',
    handicap: 6,
    credits: 15200,
    isAdmin: false,
    joinedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'user4',
    email: 'tom@riviera.com',
    fullName: 'Tom Wilson',
    clubId: 'club1',
    clubName: 'Riviera Country Club',
    ghinId: '45678901',
    handicap: 15,
    credits: 8500,
    isAdmin: false,
    joinedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'user5',
    email: 'admin@pebble.com',
    fullName: 'Robert Garcia',
    clubId: 'club2',
    clubName: 'Pebble Beach Golf Links',
    ghinId: '56789012',
    handicap: 4,
    credits: 18900,
    isAdmin: true,
    joinedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockCourses = [
  {
    id: 'course1',
    name: 'Riviera Country Club',
    rating: 74.2,
    slope: 132,
    city: 'Pacific Palisades, CA'
  },
  {
    id: 'course2',
    name: 'Pebble Beach Golf Links',
    rating: 75.8,
    slope: 142,
    city: 'Pebble Beach, CA'
  },
  {
    id: 'course3',
    name: 'Augusta National Golf Club',
    rating: 76.2,
    slope: 137,
    city: 'Augusta, GA'
  },
  {
    id: 'course4',
    name: 'Torrey Pines Golf Course',
    rating: 75.1,
    slope: 135,
    city: 'La Jolla, CA'
  }
];

export const mockMatches = [
  {
    id: 'match1',
    player1Id: 'user1',
    player2Id: 'user2',
    format: 'match-play',
    course: 'Riviera Country Club',
    wagerAmount: 500,
    status: 'completed',
    winnerId: 'user1',
    createdAt: '2024-01-20T10:00:00Z',
    completedAt: '2024-01-20T16:00:00Z',
    matchDate: '2024-01-20'
  },
  {
    id: 'match2',
    player1Id: 'user3',
    player2Id: 'user4',
    format: 'stroke-play',
    course: 'Torrey Pines Golf Course',
    wagerAmount: 750,
    status: 'completed',
    winnerId: 'user3',
    createdAt: '2024-01-22T09:00:00Z',
    completedAt: '2024-01-22T15:30:00Z',
    matchDate: '2024-01-22'
  },
  {
    id: 'match3',
    player1Id: 'user2',
    player2Id: 'user3',
    format: 'match-play',
    course: 'Riviera Country Club',
    wagerAmount: 300,
    status: 'completed',
    winnerId: 'user3',
    createdAt: '2024-01-25T11:00:00Z',
    completedAt: '2024-01-25T17:00:00Z',
    matchDate: '2024-01-25'
  },
  {
    id: 'match4',
    player1Id: 'user1',
    player2Id: 'user4',
    format: 'stroke-play',
    course: 'Pebble Beach Golf Links',
    wagerAmount: 1000,
    status: 'pending',
    createdAt: '2024-01-28T12:00:00Z',
    matchDate: '2024-02-05'
  }
];
