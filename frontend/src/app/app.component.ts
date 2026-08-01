import { Component, OnInit } from '@angular/core';
import { CanchaApiService, Team, Player, Tournament, RosterRecord } from './services/cancha-api.service';
import { AuthService, UserSession, UserRole } from './services/auth.service';
import { TranslationService, Language } from './services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  activeTab: 'dashboard' | 'teams' | 'players' | 'tournaments' = 'dashboard';
  isDarkTheme: boolean = true;
  currentLang: Language = 'en';

  // Data streams
  teams: Team[] = [];
  players: Player[] = [];
  tournaments: Tournament[] = [];
  isConnected: boolean = true;
  currentUser: UserSession | null = null;

  // Search Queries
  teamSearch: string = '';
  playerSearch: string = '';
  tourneySearch: string = '';

  // Modals visibility
  showAuthModal: boolean = false;
  showCreateTeamModal: boolean = false;
  showCreatePlayerModal: boolean = false;
  showCreateTourneyModal: boolean = false;
  showTeamDetailModal: boolean = false;
  showRegisterTourneyModal: boolean = false;

  // Auth Form Data
  authEmail: string = '';
  authRole: UserRole = 'Coaches';

  // Selected Items & Roster
  selectedTeam: Team | null = null;
  teamRoster: RosterRecord[] = [];
  selectedTourney: Tournament | null = null;

  // Form Data
  newTeam = { name: '', coach: '', city: '' };
  newPlayer = { firstName: '', lastName: '', position: 'Midfielder', email: '' };
  newTourney = { name: '', location: '', maxTeams: 16 };

  // Modal Action Form Data
  addPlayerId: string = '';
  addJerseyNumber: number = 10;
  registerTeamId: string = '';

  // Toasts
  toastMessage: string | null = null;

  constructor(
    private apiService: CanchaApiService,
    public authService: AuthService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.apiService.teams$.subscribe(data => this.teams = data);
    this.apiService.players$.subscribe(data => this.players = data);
    this.apiService.tournaments$.subscribe(data => this.tournaments = data);
    this.apiService.isConnected$.subscribe(status => this.isConnected = status);

    this.authService.currentUser$.subscribe(session => {
      this.currentUser = session;
    });

    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    // Check for Google OAuth Callback in URL Hash
    if (window.location.hash && window.location.hash.includes('id_token=')) {
      this.handleOAuthCallback();
    }
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  toggleLanguage(): void {
    const nextLang = this.translationService.toggleLanguage();
    const label = nextLang === 'es' ? '🇲🇽 Español' : '🇺🇸 English';
    this.showToast(`🌐 ${label}`);
  }


  private handleOAuthCallback(): void {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const idToken = hashParams.get('id_token');
      if (idToken) {
        const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const email = payload.email || 'google.user@gmail.com';
        const role: UserRole = (localStorage.getItem('cancha_pending_role') as UserRole) || 'Coaches';

        this.authService.loginWithToken(email, role, idToken);
        this.showToast(`✅ Signed in with Google as ${email} [${role}]!`);

        // Clean up URL hash fragment
        history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) {
      console.error('Error parsing Google OAuth response:', e);
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      if (this.toastMessage === msg) {
        this.toastMessage = null;
      }
    }, 3500);
  }

  switchTab(tab: 'dashboard' | 'teams' | 'players' | 'tournaments'): void {
    this.activeTab = tab;
  }

  // Filtered Getters
  get filteredTeams(): Team[] {
    if (!this.teamSearch.trim()) return this.teams;
    const q = this.teamSearch.toLowerCase();
    return this.teams.filter(t => t.name.toLowerCase().includes(q) || t.coach.toLowerCase().includes(q) || t.city.toLowerCase().includes(q));
  }

  get filteredPlayers(): Player[] {
    if (!this.playerSearch.trim()) return this.players;
    const q = this.playerSearch.toLowerCase();
    return this.players.filter(p => p.fullName.toLowerCase().includes(q) || p.position.toLowerCase().includes(q));
  }

  get filteredTournaments(): Tournament[] {
    if (!this.tourneySearch.trim()) return this.tournaments;
    const q = this.tourneySearch.toLowerCase();
    return this.tournaments.filter(t => t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  }

  // Auth Actions
  openAuthModal(): void {
    this.showAuthModal = true;
  }

  onSignIn(): void {
    if (!this.authEmail.trim()) {
      this.showToast('⚠️ Please enter a valid email address.');
      return;
    }
    const session = this.authService.login(this.authEmail, this.authRole);
    this.showToast(`✅ Welcome back, ${session.email}! Signed in as ${session.role}.`);
    this.showAuthModal = false;
  }

  onSocialSignIn(provider: 'Google' | 'Facebook'): void {
    if (provider === 'Google') {
      const googleClientId = '110817260217-760u6ieqju25p3l4jm31lmf6lr3n60mk.apps.googleusercontent.com';
      const redirectUri = window.location.origin; // e.g. https://d3f24tdjcq8syv.cloudfront.net
      const scope = 'email profile openid';
      const prompt = 'select_account';

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=${encodeURIComponent(scope)}&prompt=${prompt}&nonce=cancha_${Date.now()}`;

      localStorage.setItem('cancha_pending_role', this.authRole);
      window.location.href = googleAuthUrl;
      return;
    }


    const email = 'player.fb@facebook.com';
    const session = this.authService.login(email, this.authRole);
    this.showToast(`✅ Authenticated via ${provider} as ${session.email} [${session.role}]!`);
    this.showAuthModal = false;
  }



  onSignOut(): void {
    this.authService.logout();
    this.showToast('ℹ️ Signed out. Switched to Guest View-Only Mode.');
  }

  // Guarded Action Helper
  guardedAction(actionFn: () => void, requiredRole?: UserRole): void {
    if (!this.authService.isLoggedIn) {
      this.showToast('🔒 View-Only Mode: Sign in to create or modify data.');
      this.showAuthModal = true;
      return;
    }

    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      this.showToast(`⛔ Access Denied: Action requires ${requiredRole} or Admin role.`);
      return;
    }

    actionFn();
  }

  // Modal Openers
  openCreateTeamModal = (): void => {
    this.showCreateTeamModal = true;
  };

  openCreatePlayerModal = (): void => {
    this.showCreatePlayerModal = true;
  };

  openCreateTourneyModal = (): void => {
    this.showCreateTourneyModal = true;
  };


  // Create Team
  onCreateTeam(): void {
    if (!this.newTeam.name.trim() || !this.newTeam.coach.trim()) {
      this.showToast('⚠️ Please enter team name and coach name.');
      return;
    }
    this.apiService.createTeam(this.newTeam).subscribe(res => {
      this.showToast('✅ Team successfully created!');
      this.newTeam = { name: '', coach: '', city: '' };
      this.showCreateTeamModal = false;
    });
  }

  // Create Player
  onCreatePlayer(): void {
    if (!this.newPlayer.firstName.trim() || !this.newPlayer.lastName.trim()) {
      this.showToast('⚠️ First and last name are required.');
      return;
    }
    this.apiService.createPlayer(this.newPlayer).subscribe(res => {
      this.showToast('✅ Player created successfully!');
      this.newPlayer = { firstName: '', lastName: '', position: 'Midfielder', email: '' };
      this.showCreatePlayerModal = false;
    });
  }

  // Create Tournament
  onCreateTournament(): void {
    if (!this.newTourney.name.trim()) {
      this.showToast('⚠️ Tournament name is required.');
      return;
    }
    this.apiService.createTournament(this.newTourney).subscribe(res => {
      this.showToast('✅ Tournament created successfully!');
      this.newTourney = { name: '', location: '', maxTeams: 16 };
      this.showCreateTourneyModal = false;
    });
  }

  // Open Team Detail Drawer
  openTeamDetail(team: Team): void {
    this.selectedTeam = team;
    this.showTeamDetailModal = true;
    this.apiService.getTeamRoster(team.id).subscribe(roster => {
      this.teamRoster = roster;
    });
  }

  // Add Player to Roster
  onAddPlayerToRoster(): void {
    if (!this.selectedTeam || !this.addPlayerId) {
      this.showToast('⚠️ Select a player to add.');
      return;
    }
    this.apiService.addPlayerToTeam(this.selectedTeam.id, {
      playerId: this.addPlayerId,
      jerseyNumber: this.addJerseyNumber,
    }).subscribe(() => {
      this.showToast('✅ Player added to team roster!');
      this.openTeamDetail(this.selectedTeam!);
    });
  }

  // Open Register Team for Tournament
  openRegisterTourney(tourney: Tournament): void {
    this.guardedAction(() => {
      this.selectedTourney = tourney;
      this.showRegisterTourneyModal = true;
    }, 'Coaches');
  }

  onRegisterTeamForTourney(): void {
    if (!this.selectedTourney || !this.registerTeamId) {
      this.showToast('⚠️ Select a team to register.');
      return;
    }
    this.apiService.registerTeamForTournament(this.selectedTourney.id, this.registerTeamId).subscribe(() => {
      this.showToast('✅ Team registered for tournament!');
      this.showRegisterTourneyModal = false;
    });
  }
}
