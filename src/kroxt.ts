import { Kroxt } from "@kroxt/baas-sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KROXT_API_KEY, KROXT_PROJECT_ID } from "./config";

export const baas = new Kroxt({
  projectId: KROXT_PROJECT_ID,
  apiKey: KROXT_API_KEY,
  storage: AsyncStorage,
  debug: true
});

export default baas;