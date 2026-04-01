import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SuperAdminService } from '../../../shared/services/super-admin.service';

@Component({
  selector: 'app-super-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './super-admin-overview.html',
})
export class SuperAdminOverviewComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);

  stats = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.superAdminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
