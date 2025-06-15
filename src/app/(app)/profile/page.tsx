import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Medal, Star, Edit3, Mail, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Mock user data
const user = {
  name: "Usuario EXILE",
  email: "usuario@exile.app",
  rank: "Aprendiz",
  xp: 1250,
  avatarUrl: "https://placehold.co/200x200.png",
  bio: "En constante búsqueda de la superación personal y el desarrollo colectivo. Apasionado por la tecnología y el aprendizaje continuo.",
  badges: [
    { name: "Madrugador", icon: Star, color: "text-yellow-400" },
    { name: "Lector Voraz", icon: Medal, color: "text-orange-400" },
    { name: "Guerrero Disciplinado", icon: ShieldCheck, color: "text-green-400" },
  ],
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Perfil de Usuario</h1>
        <p className="text-muted-foreground">Tu identidad y progreso en la comunidad EXILE.</p>
      </div>

      <Card className="overflow-hidden shadow-xl border-primary/10">
        <div className="relative h-48 w-full">
          <Image 
            src="https://placehold.co/1200x300.png" 
            alt="Profile Banner" 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="abstract futuristic" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <CardContent className="relative -mt-16 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold font-headline text-foreground">{user.name}</h2>
              <p className="text-primary font-semibold">{user.rank} - {user.xp} XP</p>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
            <Button variant="outline" className="mt-4 sm:mt-0">
              <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gradient-red mb-2">Biografía</h3>
            <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gradient-red mb-3">Insignias Obtenidas</h3>
            <div className="flex flex-wrap gap-4">
              {user.badges.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.name} className="flex flex-col items-center p-3 bg-card rounded-lg border border-border w-28 text-center hover:border-primary/50 transition-colors" title={badge.name}>
                    <BadgeIcon className={`h-8 w-8 mb-1 ${badge.color}`} />
                    <span className="text-xs text-foreground truncate w-full">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
