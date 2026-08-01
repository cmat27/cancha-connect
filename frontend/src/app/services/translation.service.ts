import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'en' | 'es';

export interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

const DICTIONARY: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', es: 'Panel' },
  teams: { en: 'Teams', es: 'Equipos' },
  players: { en: 'Players', es: 'Jugadores' },
  tournaments: { en: 'Tournaments', es: 'Torneos' },

  // Status & Auth
  liveApi: { en: 'Live API', es: 'API En Vivo' },
  localMode: { en: 'Local Mode', es: 'Modo Local' },
  signIn: { en: 'Sign In', es: 'Iniciar Sesión' },
  logout: { en: 'Logout', es: 'Cerrar Sesión' },
  guestBannerTitle: { en: 'Guest View-Only Mode:', es: 'Modo Invitado (Solo Lectura):' },
  guestBannerDesc: {
    en: 'Anyone can browse teams, players, and match schedules. Sign in or Register as a Coach, Organizer, or Player to perform write actions.',
    es: 'Cualquiera puede explorar equipos, jugadores y torneos. Inicia sesión o regístrate como Entrenador, Organizador o Jugador para crear datos.',
  },

  // Dashboard Metrics
  keyMetrics: { en: 'Key Metrics', es: 'Métricas Clave' },
  totalTeams: { en: 'Total Teams', es: 'Total de Equipos' },
  registeredPlayers: { en: 'Registered Players', es: 'Jugadores Registrados' },
  activeTournaments: { en: 'Active Tournaments', es: 'Torneos Activos' },
  apiHealth: { en: 'API Health', es: 'Estado de API' },
  quickActions: { en: 'Quick Actions', es: 'Acciones Rápidas' },

  // Quick Action Buttons
  newTeam: { en: '+ New Team', es: '+ Nuevo Equipo' },
  newPlayer: { en: '+ New Player', es: '+ Nuevo Jugador' },
  newTournament: { en: '+ Tournament', es: '+ Torneo' },
  registeredTeamsTitle: { en: 'Registered Teams', es: 'Equipos Registrados' },
  viewAll: { en: 'View All →', es: 'Ver Todos →' },

  // Search & Filters
  searchTeams: { en: 'Search by team name or coach...', es: 'Buscar por nombre de equipo o entrenador...' },
  searchPlayers: { en: 'Search by player name or position...', es: 'Buscar por nombre de jugador o posición...' },
  searchTourneys: { en: 'Search tournaments...', es: 'Buscar torneos...' },

  // Modals & Roles
  signInModalTitle: { en: 'Sign In / Register', es: 'Iniciar Sesión / Registro' },
  signInModalSubtitle: {
    en: 'Sign in to unlock write privileges and manage teams, player rosters, or tournament schedules.',
    es: 'Inicia sesión para desbloquear permisos de escritura y gestionar equipos, plantillas y torneos.',
  },
  continueGoogle: { en: 'Continue with Google', es: 'Continuar con Google' },
  continueFacebook: { en: 'Continue with Facebook', es: 'Continuar con Facebook' },
  orEmail: { en: 'or sign in with email', es: 'o ingresa con tu correo' },
  emailLabel: { en: 'Email Address', es: 'Correo Electrónico' },
  selectRoleLabel: { en: 'Select Account Role', es: 'Selecciona tu Rol de Cuenta' },
  authButton: { en: 'Authenticate & Continue', es: 'Autenticar y Continuar' },

  // Roles
  roleCoach: { en: '📋 Coach / Team Manager', es: '📋 Entrenador / Director Técnico' },
  roleOrganizer: { en: '👑 Tournament Organizer', es: '👑 Organizador de Torneos' },
  rolePlayer: { en: '⚽ Player', es: '⚽ Jugador' },
  roleAdmin: { en: '🛡️ System Administrator', es: '🛡️ Administrador del Sistema' },

  // Team Details
  teamRoster: { en: 'Team Roster', es: 'Plantilla del Equipo' },
  addPlayerRoster: { en: 'Add Player to Roster', es: 'Agregar Jugador a Plantilla' },
  selectPlayer: { en: 'Select Player', es: 'Seleccionar Jugador' },
  jerseyNumber: { en: 'Jersey Number', es: 'Número de Camiseta' },
  registerTeamBtn: { en: 'Register Team', es: 'Registrar Equipo' },
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private langSubject = new BehaviorSubject<Language>(this.getInitialLang());
  public currentLang$ = this.langSubject.asObservable();

  constructor() {}

  private getInitialLang(): Language {
    const saved = localStorage.getItem('cancha_lang') as Language;
    if (saved === 'en' || saved === 'es') return saved;
    const browserLang = navigator.language || '';
    return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  public get currentLang(): Language {
    return this.langSubject.value;
  }

  public setLanguage(lang: Language): void {
    localStorage.setItem('cancha_lang', lang);
    this.langSubject.next(lang);
  }

  public toggleLanguage(): Language {
    const next: Language = this.currentLang === 'en' ? 'es' : 'en';
    this.setLanguage(next);
    return next;
  }

  public translate(key: string): string {
    const entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[this.currentLang] || entry.en;
  }
}
