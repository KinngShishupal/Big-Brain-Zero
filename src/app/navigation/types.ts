export type RootStackParamList = {
  Home: undefined;
  Play: undefined;
  /** `endedAt` is set when the run ended early (too smart, no retry). */
  Result: { score: number; max: number; endedAt?: number };
  Settings: undefined;
};
