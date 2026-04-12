export interface MealPlanEntry {
	day: string; // 'Monday' | 'Tuesday' | ... | 'Sunday'
	slot: string; // 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
	mealId: string;
}

export interface MealPlan {
	_id?: string;
	userId: string;
	weekStart: string; // 'YYYY-MM-DD' — always Monday
	entries: MealPlanEntry[];
}
