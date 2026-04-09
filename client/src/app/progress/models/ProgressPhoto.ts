export class ProgressPhoto {
    _id: string;
    userId: string;
    imageUrl: string;
    date: string;
    notes: string;
    weight?: number;
    createdAt?: string;

    constructor(photo?: Partial<ProgressPhoto>) {
        this._id = photo?._id || '';
        this.userId = photo?.userId || '';
        this.imageUrl = photo?.imageUrl || '';
        this.date = photo?.date || '';
        this.notes = photo?.notes || '';
        this.weight = photo?.weight;
        this.createdAt = photo?.createdAt;
    }
}
