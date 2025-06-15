"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, LifeBuoy, MessageSquare } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-gradient-red">Ayuda y Soporte</h1>
        </div>
        <p className="text-muted-foreground ml-10">
          Encuentra respuestas a tus preguntas y obtén asistencia.
        </p>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <LifeBuoy className="h-5 w-5 text-primary" />
            Preguntas Frecuentes (FAQ)
          </CardTitle>
          <CardDescription>
            Respuestas a las consultas más comunes sobre EXILE.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Actualmente, la sección de FAQ está en desarrollo. Vuelve pronto para más información.
          </p>
          {/* Aquí se podrían listar FAQs en el futuro */}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Contactar Soporte
          </CardTitle>
          <CardDescription>
            ¿Necesitas ayuda personalizada? Ponte en contacto con nuestro equipo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Para consultas de soporte, por favor envía un correo electrónico a:
          </p>
          <p>
            <a href="mailto:soporte-exile@example.com" className="text-primary hover:underline">
              soporte-exile@example.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            (Nota: Esta es una dirección de correo de ejemplo para la demostración.)
          </p>
        </CardContent>
      </Card>

       <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          EXILE está en constante evolución. Agradecemos tu paciencia y tus comentarios.
        </p>
      </div>
    </div>
  );
}
