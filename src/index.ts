import { buildState } from "./init";

const globalState = buildState();
globalState.router.requestTransition("home");
