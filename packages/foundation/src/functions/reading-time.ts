export type ReadingTimeResult = {
  minutes: number;
  words: number;
  text: string;
};

export function calculateReadingTime(text: string, wordsPerMinute = 200): ReadingTimeResult {
  const words = (text.trim().match(/\S+/g) ?? []).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return { minutes, words, text: `${minutes} min read` };
}
