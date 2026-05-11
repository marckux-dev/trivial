import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styleUrl: './app.css'
})
export class App implements OnInit {
  private game = inject(GameService);

  ngOnInit(): void {
    this.game.loadAll();
  }
}
