export type AnimationTarget = "text" | "card" | "button";

export type AnimationPreset = {
  value: string;
  label: string;
  description: string;
  className: string;
};

export const ANIMATION_PRESETS: Record<AnimationTarget, AnimationPreset[]> = {
  text: [
    { value: "none", label: "None", description: "No entrance motion", className: "" },
    { value: "fade", label: "Fade In", description: "Soft opacity reveal", className: "motion-text-fade" },
    { value: "slide-up", label: "Slide Up", description: "Rise into place", className: "motion-text-slide-up" },
    { value: "slide-down", label: "Slide Down", description: "Drop into place", className: "motion-text-slide-down" },
    { value: "slide-left", label: "Slide From Left", description: "Enter from the left", className: "motion-text-slide-left" },
    { value: "slide-right", label: "Slide From Right", description: "Enter from the right", className: "motion-text-slide-right" },
    { value: "blur", label: "Blur Reveal", description: "Sharpen as it appears", className: "motion-text-blur" },
  ],
  card: [
    { value: "none", label: "None", description: "No entrance motion", className: "" },
    { value: "fade", label: "Fade In", description: "Soft opacity reveal", className: "motion-card-fade" },
    { value: "slide-up", label: "Slide Up", description: "Lift into place", className: "motion-card-slide-up" },
    { value: "slide-left", label: "Slide From Left", description: "Enter from the left", className: "motion-card-slide-left" },
    { value: "slide-right", label: "Slide From Right", description: "Enter from the right", className: "motion-card-slide-right" },
    { value: "scale", label: "Scale In", description: "Grow into place", className: "motion-card-scale" },
    { value: "auto-slide", label: "Auto Slide", description: "Gentle continuous drift", className: "motion-card-auto-slide" },
  ],
  button: [
    { value: "none", label: "None", description: "No entrance motion", className: "" },
    { value: "fade", label: "Fade In", description: "Soft opacity reveal", className: "motion-button-fade" },
    { value: "slide-up", label: "Slide Up", description: "Rise into place", className: "motion-button-slide-up" },
    { value: "slide-down", label: "Slide Down", description: "Drop into place", className: "motion-button-slide-down" },
    { value: "slide-left", label: "Slide From Left", description: "Enter from the left", className: "motion-button-slide-left" },
    { value: "slide-right", label: "Slide From Right", description: "Enter from the right", className: "motion-button-slide-right" },
    { value: "scale", label: "Scale In", description: "Grow into place", className: "motion-button-scale" },
  ],
};

export function animationClass(target: AnimationTarget, value?: string) {
  return ANIMATION_PRESETS[target].find((preset) => preset.value === value)?.className || "";
}
