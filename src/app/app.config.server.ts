import { Provider } from "@angular/core";
import { appProviders } from "./app.config";

// Example: provide simple mocks needed for SSR (replace with real mocks as needed)
class MockFirestore {}
class MockStorage {}
class MockFunctions {}

export const serverProviders: Provider[] = [
  ...(appProviders as unknown as Provider[]),
  // provideServerRendering() removed: not exported by @angular/platform-server in this Angular version
  // Add SSR providers or compatibility mocks only if necessary for your SSR path
  // { provide: AngularFirestore, useClass: MockFirestore },
  // { provide: AngularFireStorage, useClass: MockStorage },
  // { provide: AngularFireFunctions, useClass: MockFunctions },
];
