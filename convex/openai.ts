import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";

function getOpenAI(): OpenAI {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new ConvexError(
			"Chýba OPENAI_API_KEY v Convex prostredí. Pridajte ho cez `npx convex env set OPENAI_API_KEY <key>`.",
		);
	}
	return new OpenAI({ apiKey });
}

export const analyzeDesignSystem = action({
	args: {
		imageUrls: v.array(v.string()), // Can be base64 or storage URLs
	},
	handler: async (ctx, args) => {
		const openai = getOpenAI();
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						'You are a professional brand designer and UI/UX expert. Analyze the provided images and extract a comprehensive design system. Return a JSON object with: { "colors": [ { "name": "...", "hex": "#...", "rgb": "rgb(...)" } ], "fonts": [ "Font Name 1", "Font Name 2" ], "description": "Short brand description...", "goodThings": ["List of good design elements found..."], "badThings": ["List of potential design issues or mistakes found..."], "suggestions": ["Actionable suggestions to improve the design..."] }. Ensure the colors are harmonious and extracted from the imagery. Return ONLY valid JSON.',
				},
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Analyze these inspiration images and create a professional design system.",
						},
						...args.imageUrls.map((url) => ({
							type: "image_url" as const,
							image_url: { url },
						})),
					],
				},
			],
			response_format: { type: "json_object" },
		});

		const content = response.choices[0].message.content;
		if (!content) throw new ConvexError("Failed to get response from OpenAI");

		return JSON.parse(content);
	},
});
