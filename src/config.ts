export const KROXT_PROJECT_ID = process.env.EXPO_PUBLIC_KROXT_PROJECT_ID!;
export const KROXT_API_KEY = process.env.EXPO_PUBLIC_KROXT_API_KEY!;
export const NODE_ENV = process.env.EXPO_PUBLIC_NODE_ENV!;

if (!KROXT_PROJECT_ID || !KROXT_API_KEY) {
  throw new Error(
    'Missing Kroxt config — check your .env file has EXPO_PUBLIC_KROXT_PROJECT_ID and EXPO_PUBLIC_KROXT_API_KEY set.'
  );
}