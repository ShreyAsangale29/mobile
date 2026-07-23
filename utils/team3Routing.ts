export interface WorkoutContext {
  exercise: string;
  reps: number;
  postureScore: number;
  errors: string[];
  stage: string;
}

export interface Team3Response {
  conversationalText: string;
  actionableJson: {
    action: string | null;
    parameters?: Record<string, any>;
  } | null;
}

const DEFAULT_TEAM3_URL = ""; // Loaded from configurations if present

/**
 * Team3RoutingClient
 * Forwards transcribed queries and the workout context to Team 3's AI Engine.
 * Falls back to a local rules-based engine if the API URL is not configured.
 */
export class Team3RoutingClient {
  private apiUrl: string;

  constructor(apiUrl: string = DEFAULT_TEAM3_URL) {
    this.apiUrl = apiUrl;
  }

  async sendQuery(
    text: string,
    context: WorkoutContext
  ): Promise<Team3Response> {
    console.log("[Team3RoutingClient] Sending query:", { text, context });

    // If API URL is provided, call the Team 3 endpoint
    if (this.apiUrl && this.apiUrl.trim() !== "") {
      try {
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: text,
            workoutContext: context,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();
        return {
          conversationalText: data.conversational_text ?? "I couldn't process that response.",
          actionableJson: data.actionable_json ?? null,
        };
      } catch (err) {
        console.warn("[Team3RoutingClient] Call to Team 3 failed, using Sarvam LLM fallback:", err);
        return this.callSarvamLLM(text, context);
      }
    } else {
      // No Team 3 URL - call Sarvam LLM directly
      return this.callSarvamLLM(text, context);
    }
  }

  /**
   * callSarvamLLM
   * Queries Sarvam's OpenAI-compatible Chat Completions API as a robust voice coach backend.
   */
  private async callSarvamLLM(
    text: string,
    context: WorkoutContext
  ): Promise<Team3Response> {
    const API_KEY = process.env.SARVAM_API_KEY || process.env.EXPO_PUBLIC_SARVAM_API_KEY || "sk_94j9mw05_oFB769TblKb9OMFvWtNL9ETh";
    
    const systemPrompt = `You are a professional, motivating AI fitness and yoga coach.
You are helping the user during their workout. Here is the current workout state:
- Exercise/Pose: ${context.exercise}
- Completed reps / hold seconds: ${context.reps}
- Posture accuracy score: ${context.postureScore}%
- Active posture errors: ${context.errors.join(", ") || "None"}
- Workout stage: ${context.stage}

You must respond in a friendly, encouraging, and clear voice. You support Indic-English code-mixing (e.g., Hinglish) naturally when appropriate, or respond in the language the user asked.

You MUST reply strictly in JSON format matching this schema:
{
  "conversationalText": "Your spoken feedback/answer here (keep it under 2 sentences, encouraging and direct)",
  "actionableJson": {
    "action": "one of: play_squat_anim, flex_shoulders, highlight_knees, show_breathing_bubble, glow_teal, glow_amber, or null",
    "parameters": {}
  }
}

Use these actions based on the context:
- "play_squat_anim": if squat depth is low or squat/leg movement demo is needed.
- "flex_shoulders": if back posture needs correction or shoulder flexing demo is needed.
- "highlight_knees": if knees are buckling inward or need alignment.
- "show_breathing_bubble": if the user is tired, exhausted, or asks to rest.
- "glow_amber": if there are posture errors.
- "glow_teal": for general encouragement or good form.

Do not include any text, notes, markdown blocks (like \`\`\`json), or explanations outside of the raw JSON structure.`;

    try {
      const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": API_KEY,
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "sarvam-30b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          temperature: 0.3
        })
      });

      if (!res.ok) {
        throw new Error(`Sarvam LLM HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      let content = data.choices?.[0]?.message?.content || "";
      console.log("[Team3RoutingClient] Sarvam LLM raw content:", content);

      // Clean up markdown block if model adds it
      content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(content);
      return {
        conversationalText: parsed.conversationalText ?? "Keep going!",
        actionableJson: parsed.actionableJson ?? null
      };
    } catch (err) {
      console.warn("[Team3RoutingClient] Sarvam LLM failed, using rules-based local fallback:", err);
      return this.generateLocalFallback(text, context);
    }
  }

  /**
   * generateLocalFallback
   * A rules-based local AI coach simulation. It intercepts workout metrics and
   * user queries to give realistic, low-latency audio-visual responses.
   */
  private generateLocalFallback(
    query: string,
    context: WorkoutContext
  ): Team3Response {
    const q = query.toLowerCase();
    const hasErrors = context.errors && context.errors.length > 0;
    const firstError = hasErrors ? context.errors[0].toLowerCase() : "";

    // 1. Check for specific question categories
    if (q.includes("hi") || q.includes("hello") || q.includes("start")) {
      return {
        conversationalText: `Namaste! Let's get started with your ${context.exercise} workout. You have completed ${context.reps} reps. Ready?`,
        actionableJson: { action: "glow_teal" },
      };
    }

    if (q.includes("how") || q.includes("posture") || q.includes("form") || q.includes("accuracy")) {
      if (hasErrors) {
        if (firstError.includes("knee") || q.includes("knee")) {
          return {
            conversationalText: "Watch your knees! Keep them aligned and don't let them push inward.",
            actionableJson: { action: "highlight_knees" },
          };
        }
        if (firstError.includes("back") || firstError.includes("chest") || firstError.includes("spine")) {
          return {
            conversationalText: "Keep your back straight! Engage your core to protect your spine.",
            actionableJson: { action: "flex_shoulders" },
          };
        }
        if (firstError.includes("depth") || firstError.includes("shallow") || firstError.includes("low")) {
          return {
            conversationalText: "Try to go deeper on your squats. Hips should go parallel to the floor.",
            actionableJson: { action: "play_squat_anim" },
          };
        }
        return {
          conversationalText: `Your current posture score is ${context.postureScore} percent. Try to correct: ${context.errors.join(", ")}.`,
          actionableJson: { action: "glow_amber" },
        };
      } else {
        return {
          conversationalText: `Excellent form! Your posture score is ${context.postureScore} percent. Keep pushing!`,
          actionableJson: { action: "glow_teal" },
        };
      }
    }

    if (q.includes("tired") || q.includes("fatigue") || q.includes("exhausted") || q.includes("break") || q.includes("rest")) {
      return {
        conversationalText: "Understood. Take a short breathing break now. Let's do some deep inhales.",
        actionableJson: { action: "show_breathing_bubble" },
      };
    }

    if (q.includes("rep") || q.includes("count") || q.includes("repetition")) {
      return {
        conversationalText: `You have completed ${context.reps} repetitions. Your goal is twelve. You are doing great!`,
        actionableJson: { action: "glow_teal" },
      };
    }

    // 2. Fallbacks based on workout state
    if (hasErrors) {
      if (firstError.includes("knee")) {
        return {
          conversationalText: "Please focus on your knee alignment. Avoid buckling them inward.",
          actionableJson: { action: "highlight_knees" },
        };
      }
      return {
        conversationalText: `Watch your form. Focus on keeping your alignment clean.`,
        actionableJson: { action: "glow_amber" },
      };
    }

    // Generic fallback
    return {
      conversationalText: `Keep going! You're on rep ${context.reps} of ${context.exercise}. Focus on breathing and slow controls.`,
      actionableJson: { action: "glow_teal" },
    };
  }
}
