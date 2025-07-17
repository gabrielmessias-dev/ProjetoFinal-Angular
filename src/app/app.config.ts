import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'; 
import { provideRouter } from '@angular/router';


import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCsE03j-22-tb0YAB2gIgVK_vHKJcwD38I",
  authDomain: "projeto-final-ford-enter.firebaseapp.com",
  projectId: "projeto-final-ford-enter", 
  storageBucket: "projeto-final-ford-enter.firebasestorage.app", 
  messagingSenderId: "885041816471", 
  appId: "1:885041816471:web:c5e339478181ebe5a75ad2" 
};



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};