<div align="center">
    <pre>
@@@@@@@@  @@@@@@@   @@@@@@@@  @@@       @@@ @@@   @@@@@@
@@@@@@@@  @@@@@@@@  @@@@@@@@  @@@       @@@ @@@  @@@@@@@@
@@!       @@!  @@@  @@!       @@!       @@! !@@  @@!  @@@
!@!       !@!  @!@  !@!       !@!       !@! @!!  !@!  @!@
@!!!:!    @!@!!@!   @!!!:!    @!!        !@!@!   @!@!@!@!
!!!!!:    !!@!@!    !!!!!:    !!!         @!!!   !!!@!!!!
!!:       !!: :!!   !!:       !!:         !!:    !!:  !!!
:!:       :!:  !:!  :!:        :!:        :!:    :!:  !:!
:: ::::  ::   :::   :: ::::   :: ::::     ::    ::   :::
: :: ::    :   : :  : :: ::   : :: : :     :      :   : :
    </pre>
	<p>
        <img alt="GitHub Release" src="https://img.shields.io/github/v/release/shuurei/discord-erelya-bot?include_prereleases&sort=date&display_name=tag&style=flat&label=version&color=6886ff">
        <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/shuurei/discord-erelya-bot?logo=github">
        <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/shuurei/discord-erelya-bot?logo=github">
	</p>
</div>

## 👀 About
🚀 **Erelya** is a modern, modular, and powerful Discord bot built with **TypeScript** and **Prisma** !

## ✨ Features

* 🎭 Automatic role assignment (server tags, special colors)
* 💼 `work` command with random drops and bonuses
* 📸 Auto-thread creation channels
* ⚙️ Slash commands with advanced permission handling
* 🔒 Blacklist system with per-server overrides

## ⚙️ Prerequisites

Before installing the project, make sure you have:

1. **Node.js** `>=24.x` and **npm** or **pnpm** installed
2. A **MySQL** database (or adjust `DATABASE_URL` to your database type)
3. A **Discord Application** with a bot created:
   * Go to [Discord Developer Portal](https://discord.com/developers/applications)
   * Create a new **Application** → Add a **Bot**
   * Copy your **Bot Token**
   * Enable the required **Privileged Gateway Intents**:
     * ✅ Presence Intent
     * ✅ Server Members Intent
     * ✅ Message Content Intent


## 📦 Installation

### 1. Clone the project

```bash
git clone https://github.com/discord-erelya-project/bot.git
cd bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example` and set your configuration:

```env
DISCORD_TOKEN=your_token_here
DATABASE_URL=mysql://user:password@localhost:3306/erelya_dev
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Start the bot

```bash
pnpm dev
```

## 🗂️ Project Structure

```
src
├─ client/              # Commands, Events, Managers, Bot instance..
├─ database/            # Prisma schema and services
├─ structures/          # Base classes (Command, Event, Logger..)
├─ ui/                  # Discord UI (embeds, containers, presets..)
├─ utils/               # Utility functions (string, math, date..)
├─ helpers/             # Discord Helper, Extenders..
```

## 🔑 Commands

Default prefix: **`vdev!`**

### Example:
* `vdev!authority check <user>` → Check if a user is blacklisted
* `v!work` or `/eco work` → Run an activity to earn rewards

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`@feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push your branch (`git push origin @feature/my-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the [GPL-3.0 License](./LICENSE).
