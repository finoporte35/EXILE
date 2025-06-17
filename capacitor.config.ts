
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.exile.app', // Cambia esto por el ID de tu aplicación
  appName: 'EXILE',       // El nombre de tu aplicación
  webDir: 'out',          // La carpeta de salida de 'next export'
  bundledWebRuntime: false, // `false` es generalmente recomendado para frameworks como Next.js
  server: {
    // Si necesitas servir localmente durante el desarrollo con Capacitor:
    // hostname: 'localhost', 
    // androidScheme: 'http',
    // url: 'http://192.168.1.100:3000' // Reemplaza con tu IP local si usas `next dev`
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000, // Duración del splash screen en ms
      // backgroundColor: "#ffffff", // Color de fondo (opcional)
      // androidSplashResourceName: "splash", // Nombre del recurso splash en Android (opcional)
      // iosSplashResourceName: "Splash", // Nombre del recurso splash en iOS (opcional)
    }
  }
};

export default config;
