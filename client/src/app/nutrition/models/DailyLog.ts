export interface DailyLog {
	_id: string;
	userId: string;
	date: string; // 'YYYY-MM-DD'
	meals: string[]; // array of Meal._id strings
	extraCaloriesBurned?: number;
}
