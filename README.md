# Schmerz-Radio · on 104.6

A classic cozypunk point-&-click adventure set in Quadrant E67.

> **⚠️ Pre-Alpha — actively under development.**
> Story, scenes, dialogue, art and mechanics change frequently and may break
> between versions. Save files are not guaranteed to be compatible across
> updates.

🎮 **Play the current build:** https://schmerz-radio.com

---

## About

*Schmerz-Radio* is a hand-crafted retro adventure game with a melancholic,
slightly surreal tone. You play Layard Worag, resident of room 2611, somewhere
deep inside a crumbling state housing block. A radio frequency. A neighbour
who hasn't been seen in days. An elevator that won't go where you want.
Cozypunk in spirit, oppressive in its corridors.

The game is being built **publicly and iteratively** with [Lovable](https://lovable.dev/invite/LN0I260),
an AI-assisted full-stack development environment. If you're curious about
how the sausage is made, that invite link gets you started (and gives me a
small credit bonus that helps fund further development — see below).

## Tech stack

- **TanStack Start** (React 19, file-based routing, SSR)
- **Vite 7** + **Tailwind CSS v4**
- **Lovable Cloud** (Supabase under the hood) for save games and persistence
- **@mlc-ai/web-llm** for local in-browser LLM dialogues (with cloud fallback)
- Deployed on **Cloudflare Workers**

A full list of third-party open-source components and their licenses is
shown in-game on the title screen under
*"Verwendete Freie-Software-Komponenten und Lizenzen"*.

## License

Source code is released under the **MIT License** — see [LICENSE](./LICENSE).

**Game assets are licensed separately under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)** —
see [LICENSE-ASSETS](./LICENSE-ASSETS). Images, music, story text,
character art and other creative content may be shared and adapted
(including commercially) as long as you credit *"Stephan Dörner /
Schmerz-Radio"* and release derivative works under the same license.

## Contact

Developer: **Stephan Dörner**
📧 stephan.doerner@posteo.de

## Support development

This is a private hobby project developed in spare time. Lovable credits
and cloud AI calls cost real money. If you enjoy what you see and want to
help keep development going, I'd be very grateful for a tip:

☕ **Buy me a coffee:** https://buymeacoffee.com/doener
🛠️ **Build with Lovable (referral):** https://lovable.dev/invite/LN0I260

Thank you. ♥
