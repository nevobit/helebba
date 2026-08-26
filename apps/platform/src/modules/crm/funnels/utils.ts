export const NOTE_COLORS = [
  '#ffffff',
  '#f4b6b6',
  '#f6c9a4',
  '#f3e2a2',
  '#b9e4c3',
  '#bcd6f5',
  '#d7c1f5',
  '#f2c1e5',
];

const AVATAR_COLORS = [
  '#d6409f',
  '#3d5de7',
  '#ff793f',
  '#12b76a',
  '#9e77ed',
  '#f79009',
  '#2e90fa',
  '#6172f3',
];

export const avatarColorFor = (id: string) => {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '·';
