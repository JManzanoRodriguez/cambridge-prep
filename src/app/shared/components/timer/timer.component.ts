import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  standalone: true,
  imports: []
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() duration: number = 60; // Duración en segundos
  @Input() active: boolean = true; // Si el temporizador está activo
  @Output() timeUp = new EventEmitter<void>(); // Evento cuando el tiempo se acaba
  @Output() timeChange = new EventEmitter<number>(); // Evento cuando el tiempo cambia

  timeLeft: number = 0;
  progress: number = 100;
  private interval: any;
  radius: number = 40;
  circumference: number = 2 * Math.PI * this.radius;
  dashoffset: number = 0;

  constructor() { }

  ngOnInit() {
    this.timeLeft = this.duration;
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startTimer() {
    if (this.active && !this.interval) {
      this.interval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.progress = (this.timeLeft / this.duration) * 100;
          this.dashoffset = this.circumference - (this.progress / 100) * this.circumference;
          this.timeChange.emit(this.timeLeft);
        } else {
          this.timeUp.emit();
          this.clearTimer();
        }
      }, 1000);
    }
  }

  pauseTimer() {
    this.clearTimer();
  }

  resetTimer() {
    this.clearTimer();
    this.timeLeft = this.duration;
    this.progress = 100;
    this.dashoffset = 0;
    if (this.active) {
      this.startTimer();
    }
  }

  private clearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
