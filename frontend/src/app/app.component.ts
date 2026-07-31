import { Component, OnInit } from '@angular/core';
import { CanchaApiService, Team, Player, Tournament, RosterRecord } from './services/cancha-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  activeTab: 'dashboard' | 'teams' | 'players' | 'tournaments' = 'dashboard';
  isDarkTheme: boolean = true;

  // Data streams
  teams: Team[] = [];
  players: Player[] = [];
  tournaments: Tournament[] = [];
  isConnected: boolean = true;

  // Search Queries
  teamSearch: string = '';
  playerSearch: string = '';
  tourneySearch: string = '';

  // Modals visibility
  showCreateTeamModal: boolean = false;
  showCreatePlayerModal: boolean = false;
  showCreateTourneyModal: boolean = false;
  showTeamDetailModal: boolean = false;
  showRegisterTourneyModal: boolean = false;

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

  constructor(private apiService: CanchaApiService) {}

  ngOnInit(): void {
    this.apiService.teams$.subscribe(data => this.teams = data);
    this.apiService.players$.subscribe(data => this.players = data);
    this.apiService.tournaments$.subscribe(data => this.tournaments = data);
    this.apiService.isConnected$.subscribe(status => this.isConnected = status);
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
    }, 3000);
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
    this.selectedTourney = tourney;
    this.showRegisterTourneyModal = true;
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
