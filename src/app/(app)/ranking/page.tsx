
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  xp: number;
  avatarUrl: string | null;
}

export default function RankingPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, "users");
        // Query top 20 users by XP. Ensure you have an index on 'xp' in Firestore.
        const q = query(usersRef, orderBy("xp", "desc"), limit(20));
        const querySnapshot = await getDocs(q);

        const usersData = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            rank: index + 1,
            username: data.username || 'Usuario Anónimo',
            xp: data.xp || 0,
            avatarUrl: data.avatarUrl || null,
          };
        });
        setLeaderboard(usersData);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("No se pudo cargar la tabla de clasificación. Inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-gradient-red">Tabla de Clasificación</h1>
      </div>
      <p className="text-muted-foreground ml-10 sm:ml-0">
        Compite y mira quién lidera el desarrollo en EXILE. (Top 20)
      </p>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle>Top Jugadores</CardTitle>
          <CardDescription>Los exploradores más dedicados y con mayor XP.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Cargando clasificación...</p>
            </div>
          ) : error ? (
            <p className="text-center text-destructive py-10">{error}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              Aún no hay datos suficientes para mostrar una clasificación. ¡Sigue progresando!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rango</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-center">{user.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.username} data-ai-hint="gaming avatar"/>
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">{user.xp.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
       <div className="mt-8 text-center text-xs text-muted-foreground">
        Nota: La tabla de clasificación se actualiza periódicamente. Es posible que el XP y la posición no sean en tiempo real exacto.
      </div>
    </div>
  );
}
