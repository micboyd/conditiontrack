import { Component, OnInit, ViewChild } from '@angular/core';
import { SideDrawerComponent } from '../shared/components/side-drawer/side-drawer.component';
import { TrainingBlock } from './models/TrainingBlock';
import { TrainingBlocksService } from './training-blocks.service';

@Component({
	selector: 'app-training-blocks',
	templateUrl: './training-blocks.component.html',
	standalone: false,
})
export class TrainingBlocksComponent implements OnInit {
	@ViewChild(SideDrawerComponent) drawer: SideDrawerComponent;

	blocks: TrainingBlock[] = [];
	selectedBlock: TrainingBlock | null = null;
	drawerOpen = false;
	loading = false;
	deletingId: string | null = null;

	constructor(private trainingBlocksService: TrainingBlocksService) {}

	ngOnInit(): void {
		this.loadBlocks();
	}

	loadBlocks(): void {
		this.loading = true;
		this.trainingBlocksService.getAllBlocks().subscribe({
			next: (data) => {
				this.blocks = data.map(b => new TrainingBlock(b));
				this.loading = false;
			},
		});
	}

	get activeBlock(): TrainingBlock | undefined {
		return this.blocks.find(b => b.isActive);
	}

	openDrawer(block: TrainingBlock | null): void {
		this.selectedBlock = block;
		this.drawerOpen = true;
		this.drawer.open();
	}

	onSaved(): void {
		this.drawerOpen = false;
		this.drawer.close();
		this.loadBlocks();
	}

	onCancelled(): void {
		this.drawerOpen = false;
		this.drawer.close();
	}

	deleteBlock(block: TrainingBlock): void {
		this.deletingId = block._id;
		this.trainingBlocksService.deleteBlock(block._id).subscribe({
			next: () => {
				this.deletingId = null;
				this.loadBlocks();
			},
			error: () => { this.deletingId = null; },
		});
	}

	statusLabel(block: TrainingBlock): string {
		return block.status.charAt(0).toUpperCase() + block.status.slice(1);
	}
}
