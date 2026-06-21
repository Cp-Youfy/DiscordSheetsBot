const { SlashCommandBuilder } = require("discord.js");
const { EASY_CD } = require("../../CONSTANTS.json");
const fs = require("fs");
const path = require("path");

module.exports = {
  cooldown: EASY_CD,
  data: new SlashCommandBuilder()
    .setName("o-setup-fan-roles")
    .setDescription("Setup Project Sekai fan roles (OWNER only)"),

  async execute(interaction) {
    await interaction.deferReply();

    const csvPath = path.join(
      __dirname,
      "../../assets/prsk_character_fan_colors.csv",
    );
    const lines = fs.readFileSync(csvPath, "utf8").trim().split("\n");

    const created = [];
    const failed = [];

    for (const line of lines) {
      const [name, hex] = line.split(",").map((s) => s.trim());
      if (!name || !hex) continue;

      const color = parseInt(hex.replace("#", ""), 16);

      try {
        await interaction.guild.roles.create({ name, color });
        created.push(name);
      } catch (err) {
        failed.push(name);
      }
    }

    const summary = [`Created ${created.length} role(s).`];
    if (failed.length) summary.push(`Failed: ${failed.join(", ")}`);

    await interaction.editReply(summary.join("\n"));
  },
};
