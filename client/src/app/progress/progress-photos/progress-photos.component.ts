import { Component, OnInit, ViewChild } from '@angular/core';
import { format, parseISO } from 'date-fns';

import { ProgressPhoto } from '../models/ProgressPhoto';
import { ProgressPhotosService } from './progress-photos.service';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';

interface PhotoGroup {
    monthLabel: string;
    photos: ProgressPhoto[];
}

interface DeleteConfirm {
    sessionId: string;
    imageIndex?: number;
}

@Component({
    selector: 'app-progress-photos',
    templateUrl: './progress-photos.component.html',
    standalone: false,
})
export class ProgressPhotosComponent implements OnInit {
    @ViewChild('uploadDrawer') uploadDrawer!: SideDrawerComponent;

    photos: ProgressPhoto[] = [];
    loading = true;
    deleteConfirmId: DeleteConfirm | null = null;

    constructor(private progressPhotosService: ProgressPhotosService) {}

    ngOnInit(): void {
        this.loadPhotos();
    }

    loadPhotos(): void {
        const userId = localStorage.getItem('id') || '';
        this.loading = true;
        this.progressPhotosService.getAllPhotos(userId).subscribe({
            next: (photos) => {
                this.photos = photos.sort((a, b) => b.date.localeCompare(a.date));
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            },
        });
    }

    get groupedPhotos(): PhotoGroup[] {
        const groups = new Map<string, ProgressPhoto[]>();

        for (const photo of this.photos) {
            const label = format(parseISO(photo.date), 'MMMM yyyy');
            if (!groups.has(label)) {
                groups.set(label, []);
            }
            groups.get(label)!.push(photo);
        }

        return Array.from(groups.entries()).map(([monthLabel, photos]) => ({
            monthLabel,
            photos,
        }));
    }

    openUpload(): void {
        this.uploadDrawer.open();
    }

    onPhotoUploaded(photo: ProgressPhoto): void {
        this.photos = [photo, ...this.photos].sort((a, b) => b.date.localeCompare(a.date));
        this.uploadDrawer.close();
    }

    deleteSession(id: string): void {
        this.progressPhotosService.deletePhoto(id).subscribe({
            next: () => {
                this.photos = this.photos.filter((p) => p._id !== id);
                this.deleteConfirmId = null;
            },
        });
    }

    confirmDelete(sessionId: string, imageIndex?: number): void {
        this.deleteConfirmId = { sessionId, imageIndex };
    }

    confirmDeleteSession(sessionId: string): void {
        this.deleteConfirmId = { sessionId };
    }

    cancelDelete(): void {
        this.deleteConfirmId = null;
    }

    formatDate(dateStr: string): string {
        try {
            return format(parseISO(dateStr), 'd MMM yyyy');
        } catch {
            return dateStr;
        }
    }
}
