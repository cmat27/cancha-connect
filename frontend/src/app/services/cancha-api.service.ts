import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Team {
  id: string;
  name: string;
  coach: string;
  city: string;
  playerCount?: number;
  status: string;
  createdAt: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  position: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate?: string;
  endDate?: string;
  maxTeams: number;
  status: string;
}

export interface RosterRecord {
  PK: string;
  SK: string;
  jerseyNumber?: number;
  role: string;
  age?: number;
  gender?: string;
  joinedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CanchaApiService {
  private apiUrl = 'http://localhost:3000';

  private isConnectedSubject = new BehaviorSubject<boolean>(true);
  public isConnected$ = this.isConnectedSubject.asObservable();

  private teamsSubject = new BehaviorSubject<Team[]>([
    {
      id: 'team-mock-1',
      name: 'Galácticos FC',
      coach: 'Carlos Valderrama',
      city: 'Barranquilla',
      playerCount: 18,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'team-mock-2',
      name: 'Tigres del Sur',
      coach: 'Diego Simeone',
      city: 'Buenos Aires',
      playerCount: 22,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ]);
  public teams$ = this.teamsSubject.asObservable();

  private playersSubject = new BehaviorSubject<Player[]>([
    {
      id: 'player-mock-1',
      firstName: 'Lionel',
      lastName: 'Cuccittini',
      fullName: 'Lionel Cuccittini',
      position: 'Forward',
      email: 'leo@canchaconnect.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'player-mock-2',
      firstName: 'Federico',
      lastName: 'Valverde',
      fullName: 'Federico Valverde',
      position: 'Midfielder',
      email: 'fede@canchaconnect.com',
      createdAt: new Date().toISOString(),
    },
  ]);
  public players$ = this.playersSubject.asObservable();

  private tournamentsSubject = new BehaviorSubject<Tournament[]>([
    {
      id: 'tourney-mock-1',
      name: 'Copa Primavera 2026 🏆',
      location: 'Estadio Metropolitano',
      startDate: '2026-08-15',
      endDate: '2026-09-30',
      maxTeams: 16,
      status: 'UPCOMING',
    },
  ]);
  public tournaments$ = this.tournamentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshAll();
  }

  refreshAll() {
    this.fetchTeams().subscribe();
    this.fetchPlayers().subscribe();
    this.fetchTournaments().subscribe();
  }

  fetchTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/teams`).pipe(
      tap((data) => {
        if (Array.isArray(data)) {
          this.teamsSubject.next(data);
          this.isConnectedSubject.next(true);
        }
      }),
      catchError((err) => {
        console.warn('API Offline or unreachable, using local state:', err.message);
        this.isConnectedSubject.next(false);
        return of(this.teamsSubject.value);
      })
    );
  }

  createTeam(payload: { name: string; coach: string; city?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/teams`, payload).pipe(
      tap((res) => {
        if (res?.team) {
          const updated = [res.team, ...this.teamsSubject.value];
          this.teamsSubject.next(updated);
        }
      }),
      catchError((err) => {
        const localTeam: Team = {
          id: 'team-' + Date.now(),
          name: payload.name,
          coach: payload.coach,
          city: payload.city || 'Unknown',
          playerCount: 0,
          status: 'PENDING_REGISTRATION',
          createdAt: new Date().toISOString(),
        };
        const updated = [localTeam, ...this.teamsSubject.value];
        this.teamsSubject.next(updated);
        return of({ message: 'Team created (Local)', team: localTeam });
      })
    );
  }

  fetchPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/players`).pipe(
      tap((data) => {
        if (Array.isArray(data)) {
          this.playersSubject.next(data);
        }
      }),
      catchError(() => of(this.playersSubject.value))
    );
  }

  createPlayer(payload: { firstName: string; lastName: string; position?: string; email?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/players`, payload).pipe(
      tap((res) => {
        if (res?.player) {
          const updated = [res.player, ...this.playersSubject.value];
          this.playersSubject.next(updated);
        }
      }),
      catchError(() => {
        const localPlayer: Player = {
          id: 'player-' + Date.now(),
          firstName: payload.firstName,
          lastName: payload.lastName,
          fullName: `${payload.firstName} ${payload.lastName}`,
          position: payload.position || 'Unassigned',
          email: payload.email,
          createdAt: new Date().toISOString(),
        };
        const updated = [localPlayer, ...this.playersSubject.value];
        this.playersSubject.next(updated);
        return of({ message: 'Player created (Local)', player: localPlayer });
      })
    );
  }

  addPlayerToTeam(teamId: string, payload: { playerId: string; jerseyNumber?: number; role?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/teams/${teamId}/players`, payload).pipe(
      catchError(() => of({ message: 'Player added to team roster (Local)' }))
    );
  }

  getTeamRoster(teamId: string): Observable<RosterRecord[]> {
    return this.http.get<RosterRecord[]>(`${this.apiUrl}/teams/${teamId}/players`).pipe(
      catchError(() => of([]))
    );
  }

  fetchTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(`${this.apiUrl}/tournaments`).pipe(
      tap((data) => {
        if (Array.isArray(data)) {
          this.tournamentsSubject.next(data);
        }
      }),
      catchError(() => of(this.tournamentsSubject.value))
    );
  }

  createTournament(payload: { name: string; location?: string; maxTeams?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tournaments`, payload).pipe(
      tap((res) => {
        if (res?.tournament) {
          const updated = [res.tournament, ...this.tournamentsSubject.value];
          this.tournamentsSubject.next(updated);
        }
      }),
      catchError(() => {
        const localTourney: Tournament = {
          id: 'tourney-' + Date.now(),
          name: payload.name,
          location: payload.location || 'TBD',
          maxTeams: payload.maxTeams || 16,
          status: 'UPCOMING',
        };
        const updated = [localTourney, ...this.tournamentsSubject.value];
        this.tournamentsSubject.next(updated);
        return of({ message: 'Tournament created (Local)', tournament: localTourney });
      })
    );
  }

  registerTeamForTournament(tourneyId: string, teamId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tournaments/${tourneyId}/teams`, { teamId }).pipe(
      catchError(() => of({ message: 'Team registered for tournament (Local)' }))
    );
  }
}
