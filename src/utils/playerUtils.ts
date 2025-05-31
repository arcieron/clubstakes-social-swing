
// Utility functions for player ID formatting
export const getDisplayId = (idNumber: number): string => {
  return `rivi${idNumber}`;
};

export const formatPlayerDisplay = (player: { full_name: string; id_number: number }): string => {
  return `${player.full_name} (${getDisplayId(player.id_number)})`;
};
