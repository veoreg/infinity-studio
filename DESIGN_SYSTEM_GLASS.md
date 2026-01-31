# GOLDEN GLASS BUTTON DESIGN SYSTEM (iPhone Style)
> **Design Philosophy**: "iPhone Glass" — High transparency, heavy blur ("Thick Glass" effect), and premium brand glow.

## 1. Core Principles
- **Transparency**: High transparency (`bg-black/20`) to let the background shine through.
- **Depth**: Heavy blur (`backdrop-blur-xl`) creates the illusion of thick, premium glass.
- **Legibility**: Text shadows (`drop-shadow-md`) ensure text is readable even on complex backgrounds.
- **Feedback**: "Golden Brand Glow" on hover simulates the glass catching light.

---

## 2. CSS / Tailwind Implementation
Use these exact classes to replicate the design.

### A. The "Glass" Base (Container)
This defines the material of the button.
```css
bg-black/20           /* High transparency (20% opacity) */
backdrop-blur-xl      /* Heavy blur for "thick glass" feel */
border border-white/20 /* Subtle white rim, simulating edge reflection */
rounded-xl            /* Modern, soft corners (or rounded-full for icons) */
shadow-lg             /* Depth against the canvas */
```

### B. Text & Icon Typography
Ensures readability on transparent glass.
```css
text-white            /* Brighter than standard text-secondary */
drop-shadow-md        /* Critical: Separates text from background */
font-black            /* Heavy weight for stylized labels */
uppercase             /* Brand style */
tracking-[0.2em]      /* Brand style */
```

### C. The "Golden Glow" (Hover State)
Simulates internal illumination or catching ease light.
```css
hover:shadow-[0_0_20px_rgba(210,172,71,0.4)]  /* The Golden Glow */
hover:border-[#d2ac47]/50                    /* Rim lights up gold */
hover:text-[#d2ac47]                         /* Text/Icon turns gold */
hover:scale-105                              /* Subtle lift effect */
transition-all                               /* Smooth animation */
```

### D. The "Destructive Glow" (Hover State)
For Close/Delete actions.
```css
hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]   /* Red Glow */
hover:border-red-500/50                      /* Rim lights up red */
hover:text-red-500                           /* Icon turns red */
```

---

## 3. Full Tailwind Component Examples

### Standard Action Button (e.g., "TO VIDEO")
```tsx
<button className="
    px-4 py-2 
    bg-black/20 backdrop-blur-xl border border-white/20 
    text-white drop-shadow-md 
    rounded-xl 
    hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:border-[#d2ac47]/50 hover:text-[#d2ac47] 
    transition-all flex items-center gap-2 shadow-lg hover:scale-105
">
    <Icon size={14} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">BUTTON TEXT</span>
</button>
```

### Icon Button (e.g., "Maximize")
```tsx
<button className="
    p-2.5 
    bg-black/20 backdrop-blur-xl border border-white/20 
    text-white drop-shadow-md 
    rounded-full 
    hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] hover:border-[#d2ac47]/50 hover:text-[#d2ac47] 
    transition-all hover:scale-110 shadow-lg
">
    <Icon size={16} />
</button>
```

---

## 4. Usage Rules
1.  **Do NOT** use solid backgrounds (`bg-zinc-900`) for canvas controls. Always use the Glass Base.
2.  **Do NOT** remove `backdrop-blur-xl`. Lower blur (`md` or `sm`) looks like plastic, not glass.
3.  **Do NOT** forget `drop-shadow-md` on text. Without it, text disappears on light backgrounds.
