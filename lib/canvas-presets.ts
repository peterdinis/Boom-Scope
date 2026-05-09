export interface CanvasPreset {
	id: string;
	name: string;
	width: number;
	height: number;
	icon: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
	{
		id: "fb-post",
		name: "Facebook Post",
		width: 1200,
		height: 630,
		icon: "facebook",
	},
	{
		id: "fb-cover",
		name: "Facebook Cover",
		width: 820,
		height: 312,
		icon: "facebook",
	},
	{
		id: "ig-post",
		name: "Instagram Post",
		width: 1080,
		height: 1080,
		icon: "instagram",
	},
	{
		id: "twitter-post",
		name: "Twitter Post",
		width: 1200,
		height: 675,
		icon: "twitter",
	},
	{
		id: "twitter-header",
		name: "Twitter Header",
		width: 1500,
		height: 500,
		icon: "twitter",
	},
	{
		id: "linkedin-post",
		name: "LinkedIn Post",
		width: 1200,
		height: 627,
		icon: "linkedin",
	},
];
